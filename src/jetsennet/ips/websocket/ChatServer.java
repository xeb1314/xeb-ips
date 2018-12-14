package jetsennet.ips.websocket;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetSocketAddress;
import java.net.UnknownHostException;
import java.nio.channels.NotYetConnectedException;
import java.util.Collection;
import java.util.Date;

import jetsennet.frame.security.UserProfileInfo;
import jetsennet.ips.business.ReportBusiness;
import jetsennet.ips.mts.ICommand;
import jetsennet.ips.mts.IMtsFormat;
import jetsennet.ips.mts.MtsAck;
import jetsennet.ips.mts.MtsFormat;
import jetsennet.ips.mts.MtsTerminalOperation;
import jetsennet.ips.mts.MtsUserCheckin;
import jetsennet.ips.schema.IpsTeminaloperationstat;
import jetsennet.juum.business.UserBusiness;
import jetsennet.juum.schema.User;
import jetsennet.juum.schema.Usergroup;
import jetsennet.util.ConfigUtil;
import jetsennet.util.DateUtil;
import jetsennet.util.SpringContextUtil;

import org.apache.log4j.Logger;
import org.java_websocket.WebSocket;
import org.java_websocket.WebSocketImpl;
import org.java_websocket.framing.Framedata;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

/**
 * A simple WebSocketServer implementation. Keeps track of a "chatroom".
 */
public class ChatServer extends WebSocketServer {

	private IMtsFormat messageFormat = new MtsFormat();
	private UserWebSocketAuthentication userAuth = new UserWebSocketAuthentication();
	private ReportBusiness reportBusiness = null;
	private static final int port = Integer.parseInt(ConfigUtil.getProperty("WebSocketServerPort"));
	private static final Logger logger = Logger.getLogger(ChatServer.class);
	public ChatServer() throws UnknownHostException {
		super( new InetSocketAddress( port ) );
		userAuth.setUserBusiness((UserBusiness) SpringContextUtil.getBean("userBusiness"));
		reportBusiness = (ReportBusiness) SpringContextUtil.getBean("reportBusiness");
	}

	public ChatServer( InetSocketAddress address ) {
		super( address );
	}

	
	@Override
	public void onOpen( WebSocket conn, ClientHandshake handshake ) {
	}

	private void init() throws Exception
	{
		WebSocketImpl.DEBUG = true;
		this.start();
	}
	
	private void destory()
	{
		try {
			this.stop();
		} catch (Exception e) {
			logger.equals("destory:"+e);
		}
	}
	
	@Override
	public void onClose( WebSocket conn, int code, String reason, boolean remote ) {
		String loginIp = conn.getRemoteSocketAddress().getAddress().getHostAddress();
		UserProfileInfo userProfileInfo = userAuth.getUserByToken(loginIp);
		if(userProfileInfo==null)return;
		userAuth.logoutUser(userProfileInfo.getLoginId(), loginIp);
	}

	@Override
	public void onMessage( WebSocket conn, String message ) {
		try {
			onRequest(conn,message);
		} catch (Exception e) {
			logger.error("ChatServer onMessage error :"+e);
		}
	}

	/**
	 * 应答websocket请求消息处理
	 */
	public String onRequest(WebSocket conn,String messageText) throws Exception
	{
	        ICommand command = null;
	        MtsAck mtsAck = new MtsAck();

	        try
	        {
	            command = (ICommand) messageFormat.unmarshal(messageText);
	        }
	        catch (Exception e)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("无法识别消息");
	            return messageFormat.marshal(mtsAck);
	        }

	        if (command == null)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("无法识别消息");
	            return messageFormat.marshal(mtsAck);
	        }

	        String result = null;

	        try
	        {
	            result = messageFormat.marshal(onMessage(conn,command));
	        }
	        catch (Exception ex)
	        {
	            mtsAck.setStateCode(-1);
	            mtsAck.setStateDesc("处理消息异常");
	            return messageFormat.marshal(mtsAck);
	        }

	        return result;
	}
	
	  /**
     * 消息处理
     * 接收执行器的websocket消息
     * 接收接口过来的websocket消息
     * @param command MTS消息命令
     * @return
     */
    public ICommand onMessage(WebSocket conn,ICommand command)
    {
    	MtsAck mtsAck = new MtsAck();
    	if (command instanceof MtsUserCheckin)
    	{
    		MtsUserCheckin mtsTaskResult = (MtsUserCheckin) command;
    		return onMtsUserCheckin(conn,mtsTaskResult);
    	}
    	return mtsAck;
    }
    
    public ICommand onMtsUserCheckin(WebSocket conn,MtsUserCheckin mtsTaskResult)
    {
     	MtsAck mtsAck = new MtsAck();
    	try {
    		userAuth.userLogin(mtsTaskResult.getUserName(), "", conn.getRemoteSocketAddress().getAddress().getHostAddress());
    		//TODO 向登录的客户端推送第一次数据
    		conn.send("login success");
    		sendToAll("");
		} catch (Exception e) {
            mtsAck.setStateCode(-1);
            mtsAck.setStateDesc("处理消息异常:"+e);
            logger.error("onMtsUserCheckin处理消息异常:"+e);
		}
    	return mtsAck;
    }
    
	@Override
	public void onFragment( WebSocket conn, Framedata fragment ) {
		System.out.println( "received fragment: " + fragment );
	}

	public void onRecieveTerminalOperation(MtsTerminalOperation mtsTerminalOperation) throws Exception
	{
		reportBusiness.recieveTerminalOperation(mtsTerminalOperation);
		sendToAll("");
	}
	
	@Override
	public void onError( WebSocket conn, Exception ex ) {
		ex.printStackTrace();
		if( conn != null ) {
			// some errors like port binding failed may not be assignable to a specific websocket
		}
	}

	/**
	 * Sends <var>text</var> to all currently connected WebSocket clients.
	 * 
	 * @param text
	 *            The String to send across the network.
	 * @throws InterruptedException
	 *             When socket related I/O errors occur.
	 */
	public void sendToAll( String text ) {
		Collection<WebSocket> con = connections();
		synchronized ( con ) {
			for( WebSocket c : con ) {
				 UserProfileInfo uu = userAuth.getUserByToken(c.getRemoteSocketAddress().getAddress().getHostAddress());
				try {
					c.send(reportBusiness.reportStatBySelf(uu));
				} catch (NotYetConnectedException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				} catch (Exception e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}
		}
	}
}
