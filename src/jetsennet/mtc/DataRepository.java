package jetsennet.mtc;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

import jetsennet.mtc.business.MtsBusiness;
import jetsennet.mtc.schema.Server;
import jetsennet.serializer.XMLSerializer;
import jetsennet.util.SpringContextUtil;
import jetsennet.util.TwoTuple;

/**
 * 具有缓存功能的manager、actor的数据提供者
 * 
 * @author Liming
 */
public class DataRepository 
{
	public static final int SERVER_TYPE_MANAGER = 1;
	public static final int SERVER_TYPE_ACTOR = 2;
    public static final int INFO_TYPE_ACTOR = 3;

    private static final int HTTP_REQ_TIMEOUT = 5;

    /**[actorId, provider]，保存各个actor的数据提供商**/
    private static ConcurrentHashMap<String, DataProvider> providers = new ConcurrentHashMap<String, DataProvider>();

    private static final ExecutorService EXEC = Executors.newCachedThreadPool(new ThreadFactory()
    {
        final ThreadGroup group = (System.getSecurityManager() != null)
            ? System.getSecurityManager().getThreadGroup()
            : Thread.currentThread().getThreadGroup();
        final AtomicInteger threadNumber = new AtomicInteger(1);
        @Override
        public Thread newThread(Runnable r)
        {
            Thread t = new Thread(group, r, "pool-DataRepository-" + threadNumber.getAndIncrement(), 0);
            if (t.isDaemon())
                t.setDaemon(false);
            if (t.getPriority() != Thread.NORM_PRIORITY)
                t.setPriority(Thread.NORM_PRIORITY);
            return t;
        }
    });

    /**
     * 获取执行器配置信息
     * @param actorID
     * @param actorURL
     * @return
     * @throws Exception
     */
    public static String getActorInfo(final String actorID,final String actorURL) throws Exception
    {
        final DataProvider tempProvider = genProvider(INFO_TYPE_ACTOR);
        Future<String> resultFuture = EXEC.submit(new Callable<String>()
        {
            @Override
            public String call() throws Exception
            {
                DataProvider provider = providers.putIfAbsent(getActorInfoKey(actorURL), tempProvider);
                if (provider == null)
                {
                    provider = tempProvider;
                }
                return provider.getResult(new TwoTuple<String, String>(actorID, actorURL)).toString();
            }
        });
        
        String resultStr;
        try
        {
            resultStr = resultFuture.get(HTTP_REQ_TIMEOUT, TimeUnit.SECONDS);
        }
        catch (TimeoutException e)
        {
            throw new Exception(String.format("请求执行器【%s】超时", actorID));
        }
        catch (Exception e)
        {
            throw new Exception(String.format("请求执行器【%s】异常", actorID));
        }

        return resultStr;
        
    }

    /**
     * 获取单个服务器worker状态
     * @param server
     * @return
     * @throws Exception
     */
    public static String getWorkerState(final Server server) throws Exception
    {
        final StringBuffer param = new StringBuffer();
        if (server.getServerType() == DataRepository.SERVER_TYPE_ACTOR)
        {
            HashMap<String, String> paramMap = new HashMap<String, String>();
            paramMap.put("id", server.getHostIp());
            paramMap.put("url", String.format("http://%s:%s", server.getHostIp(), server.getHostPort()));
            param.append("<ACTORS>" + XMLSerializer.serializeStrMapWithoutHeader(paramMap, "ACTOR") + "</ACTORS>");
        }
        else
        {
            HashMap<String, String> paramMap = new HashMap<String, String>();
            paramMap.put("id", server.getHostIp());
            paramMap.put("url", String.format("http://%s:%s", server.getHostIp(), server.getHostPort()));
            param.append("<MANAGERS>" + XMLSerializer.serializeStrMapWithoutHeader(paramMap, "MANAGER") + "</MANAGERS>");
        }

        final DataProvider tempProvider = genProvider(server.getServerType());
        Future<String> resultFuture = EXEC.submit(new Callable<String>()
        {
            @Override
            public String call() throws Exception
            {
                DataProvider provider = providers.putIfAbsent(getStateKey(server.getServerId()), tempProvider);
                if (provider == null)
                {
                    provider = tempProvider;
                }
                return provider.getResult(param).toString();
            }
        });

        String resultStr;
        try
        {
            resultStr = resultFuture.get(HTTP_REQ_TIMEOUT, TimeUnit.SECONDS);
        }
        catch (Exception e)
        {
            resultStr = "{\"workerList\":[]}";
        }

        return resultStr;
    }

    /**
     * 获取多个执行器worker状态
     * @param serverLst
     * @return
     * @throws Exception
     */
    public static Map<String, String> getWorkerStates(final List<Server> serverLst) throws Exception
    {
        List<Callable<String>> reqTask = new ArrayList<Callable<String>>();
        for (Server server : serverLst)
        {
            final StringBuffer param = new StringBuffer();
            if (server.getServerType() == DataRepository.SERVER_TYPE_ACTOR)
            {
                HashMap<String, String> paramMap = new HashMap<String, String>();
                paramMap.put("id", server.getHostIp());
                paramMap.put("url", String.format("http://%s:%s", server.getHostIp(), server.getHostPort()));
                param.append("<ACTORS>" + XMLSerializer.serializeStrMapWithoutHeader(paramMap, "ACTOR") + "</ACTORS>");
            }
            else
            {
                HashMap<String, String> paramMap = new HashMap<String, String>();
                paramMap.put("id", server.getHostIp());
                paramMap.put("url", String.format("http://%s:%s", server.getHostIp(), server.getHostPort()));
                param.append("<MANAGERS>" + XMLSerializer.serializeStrMapWithoutHeader(paramMap, "MANAGER") + "</MANAGERS>");
            }

            final DataProvider tempProvider = genProvider(server.getServerType());
            final String serverId = server.getServerId();
            reqTask.add(new Callable<String>()
            {
                @Override
                public String call() throws Exception
                {
                    DataProvider provider = providers.putIfAbsent(getStateKey(serverId), tempProvider);
                    if (provider == null)
                    {
                        provider = tempProvider;
                    }
                    return provider.getResult(param).toString();
                }
            });
        }

        List<Future<String>> futureLst = EXEC.invokeAll(reqTask, HTTP_REQ_TIMEOUT, TimeUnit.SECONDS);
        
        Map<String, String> resultMap=new HashMap<String, String>();
        
        int index = 0;
        for (Future<String> future : futureLst)
        {
            Server server = serverLst.get(index++);
            String result = "";
            try
            {
                result = future.get();
            }
            catch (Exception e)
            {
                result = "{\"workerList\":[]}";
            }
            resultMap.put(server.getHostIp(), result);
        }
        return resultMap;
    }

    private static String getStateKey(String serverId)
    {
        return serverId + "_WORKERSTATE";
    }

    private static String getActorInfoKey(String serverId)
    {
        return serverId + "_ACTORINFO";
    }

	private static DataProvider genProvider(int serverType) 
	{
		if(SERVER_TYPE_ACTOR ==serverType)
		{
			return new ActorDataProvider();
		}
		else if(SERVER_TYPE_MANAGER == serverType)
		{
			return new ManagerDataProvider();
        }
        else if (INFO_TYPE_ACTOR == serverType)
        {
            return new ActorConfigProvider();
		}
		return null;
	}
}

abstract class DataProvider 
{
    protected final Lock lock = new ReentrantLock();//锁
    private static final int HTTP_REQ_TIMEOUT = 6;
	private Object resultVal;	//数据
	private long updateTime;	//更新时间
	
	public Object getResult(Object param) throws Exception
	{
        //判断数据是否超时
        if (isOutofTime(updateTime))
        {
            //如果超时，竞争更新数据锁
            if (lock.tryLock(HTTP_REQ_TIMEOUT, TimeUnit.SECONDS))
            {
                try
                {
                    //获取锁后，再次判断是否超时
                    if (isOutofTime(updateTime))
                    {
                        resultVal = reloadResult(param);
                        updateTime = System.currentTimeMillis();
                    }
                }
                finally
                {
                    lock.unlock();
                }
            }
            else
            {
                throw new TimeoutException("请求阻塞异常");
            }
        }

        return resultVal;
	}
	
    protected abstract Object reloadResult(Object param) throws Exception;//加载数据
	
	protected abstract boolean isOutofTime(long updateTime);//判断是否失效
}

/**
 * actor数据源(workerState)
 */
class ActorDataProvider extends DataProvider
{
	private static final long REFRESH_INTERVAL = 1000 * 3;//刷新间隔
	
	@Override
    protected Object reloadResult(Object param) throws Exception
	{
		MtsBusiness business = SpringContextUtil.getBean("mtsBusiness", MtsBusiness.class);
        return business.getWorkerState(param.toString());
	}

	@Override
	protected boolean isOutofTime(long updateTime) 
	{
		return System.currentTimeMillis() - updateTime >= REFRESH_INTERVAL;
	}
}

/**
 * actor数据源(actorinfo)
 */
class ActorConfigProvider extends ActorDataProvider
{
    @SuppressWarnings("unchecked")
    @Override
    protected Object reloadResult(Object param) throws Exception
    {
        MtsBusiness business = SpringContextUtil.getBean("mtsBusiness", MtsBusiness.class);
        TwoTuple<String, String> paramTwo = (TwoTuple<String, String>) param;
        String config = business.getActorConfig(paramTwo.first, paramTwo.second);
        return config;
    }
}

/**
 * manager数据源
 */
class ManagerDataProvider extends DataProvider
{
	private static final long REFRESH_INTERVAL = 1000 * 5;//刷新间隔
	
	@Override
    protected Object reloadResult(Object param) throws Exception
	{
	    MtsBusiness business = SpringContextUtil.getBean("mtsBusiness", MtsBusiness.class);
		return business.getAllWorkerState(param.toString());
	}

	@Override
	protected boolean isOutofTime(long updateTime) 
	{
		return System.currentTimeMillis() - updateTime >= REFRESH_INTERVAL;
	}
}


