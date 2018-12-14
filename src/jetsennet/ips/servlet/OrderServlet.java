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
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.atomic.AtomicBoolean;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import jetsennet.ips.business.IpsOrderBusiness;
import jetsennet.util.ConfigUtil;
import jetsennet.util.SpringContextUtil;

/**
 * 
 * Strategy初始化Servlet
 *
 */
public class OrderServlet extends HttpServlet
{
	private static final long serialVersionUID = 1L;
	
	private Timer timer = null;
	private AtomicBoolean timerStarted = null;
	private long timeInterval = 10000;
	private TimerTask task = null;
	private String scanTime = null;
	private IpsOrderBusiness ipsOrderBusiness = (IpsOrderBusiness) SpringContextUtil.getBean("ipsOrderBusiness");
	
	public OrderServlet() {
		super();
		timerStarted = new AtomicBoolean(false);
		timer = new Timer("OrderStrategy", true);
	}
	
	private void start() {
		if (timerStarted.get()) {
			return;
		}
		task = new TimerTask() {
			@Override
			public void run() {
				
				try {
					ipsOrderBusiness.selectOrder();
				} catch (Exception e) {
					e.printStackTrace();
				}
			}
		};

		timer.schedule(task, 1000, timeInterval);
		timerStarted.set(true);
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
			String isstartStrategy = ConfigUtil.getProperty("strategy.server.start");
			if("true".equals(isstartStrategy)) {
				start();
			}
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
