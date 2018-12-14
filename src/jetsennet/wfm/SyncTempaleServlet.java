/**
 * 日  期：2012-09-22
 * 作  者: wangjun
 * 版  本： 1.0
 * 描  述: 同步模板到actor，对于没有更新的模板不同步
 * 
 */
package jetsennet.wfm;


import java.util.Timer;
import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class SyncTempaleServlet extends  HttpServlet
{	 
	 private int syncTemplateInterval = 60000;
	 private Timer syncTemplateTimer; 
	 private SyncTempaleTask syncTask = null;
	    
    public void init() throws ServletException {
    	syncTask = new SyncTempaleTask();
    	syncTemplateTimer = new Timer();
    	syncTemplateTimer.schedule(syncTask, 60000, syncTemplateInterval);
	}

	
	public void destroy() {
		super.destroy();
		if (syncTemplateTimer != null)
		{
			syncTemplateTimer.cancel();
		}
	}
    
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		this.doPost(request, response);
        
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		
	}  
}
