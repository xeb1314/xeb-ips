/************************************************************************
日  期：		2012-08-15
作  者:		李小敏
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.ips.servlet;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.SQLException;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.frame.business.BaseBusiness;
import jetsennet.net.WSResult;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SpringContextUtil;

import org.uorm.dao.common.SqlParameter;

import com.alibaba.fastjson.JSONArray;

/**
 * 
 * Strategy初始化Servlet  应用任务告警 没有完善，后续有需求在完善
 *
 */
public class AlarmServlet extends HttpServlet
{
	private static final long serialVersionUID = 1L;
	
	private Timer timer = null;
	private AtomicBoolean timerStarted = null;
	private long timeInterval = 10000;
	private TimerTask task = null;
	private String scanTime = null;
	private BaseBusiness alarmBusiness = (BaseBusiness) SpringContextUtil.getBean("baseBusiness");
	private final String taskSql = "SELECT * FROM IPS_TASK WHERE TASK_STATE=11";
	
	public AlarmServlet() {
		super();
		timerStarted = new AtomicBoolean(false);
		timer = new Timer("AlarmStrategy", true);
	}
	
	private void start() {
		if (timerStarted.get()) {
			return;
		}
		task = new TimerTask() {
			@Override
			public void run() {
				
				try {
//					ipsOrderBusiness.selectOrder();
//					processAlarm();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};

		timer.schedule(task, 1000, timeInterval);
		timerStarted.set(true);
	} 

	public void processAlarm(){
		String result = null;
		try {
			//获取正运行中的任务
			result = alarmBusiness.getDao().fillJson(taskSql, new SqlParameter[0]);
			//把String 转换成json数组
			JSONArray jsonArray= JSONArray.parseArray(result);
			for(int i=0;i<jsonArray.size();i++){
				
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void destroy()
	{
		super.destroy();		
	}
	
	@Override
	public void init() throws ServletException
	{
		try {
			//启动策略线程
			/*String isstartStrategy = ConfigUtil.getProperty("strategy.server.start");
			if("true".equals(isstartStrategy)) {
				start();
			}*/
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void doPost(HttpServletRequest request, HttpServletResponse response) 
	throws javax.servlet.ServletException, IOException
	{
		response.setContentType("text/xml;charset=UTF-8");
		
		InputStreamReader inr = new InputStreamReader(request.getInputStream(), java.nio.charset.Charset.forName("utf-8"));
		StringWriter sw = new StringWriter();
		char[] buf = new char[8096];
		int size = 0;
		while ((size = inr.read(buf)) != -1)
		{
			sw.write(buf, 0, size);
		}

		sw.close();
		inr.close();
		
		String messgeText = sw.toString();
		

		PrintWriter out = response.getWriter();
		try
		{
			out.write(messgeText);
		}
		catch (Exception ex)
		{			
		}
		finally
		{
			out.close();
		}
	}
	
	@Override
	public void doGet(HttpServletRequest request, HttpServletResponse response) 
	throws javax.servlet.ServletException, IOException
	{
		doPost(request, response);
	}
}
