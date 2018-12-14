package test;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.net.UnknownHostException;

import com.ibm.db2.jcc.b.l;

public class TestSendMsgToServer {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		try {
			String xmls = "<mts version=\"2.1\"><mtsDeviceRegister><SystemID>999</SystemID><DeviceID>111</DeviceID><SystemName>测试系统</SystemName><DeviceName>设备2</DeviceName><ManagerIP>192.168.1.233</ManagerIP><ManagerPort>7777</ManagerPort><ProtocolType></ProtocolType></mtsDeviceRegister></mts>";
			
			String msgOrder = "<mts version=\"2.1\"><mtsOrderInfo><userName>1</userName><orderId>2</orderId><DsID>3</DsID><tableName>444</tableName><orderInfo>543</orderInfo></mtsOrderInfo></mts>";
					
//					<mts version="2.1">
//						<mtsOrderInfo>
//							<userName></userName>
//							<orderId></orderId>
//							<DsID></DsID>
//							<tableName>表名</tableName>
//							<orderInfo></orderInfo>
//						</mtsOrderInfo>
//					</mts>
			
			Socket socket = new Socket("127.0.0.1",10211);
			
			OutputStream outputStream = socket.getOutputStream();
			InputStream inputStream = socket.getInputStream();
			
			OutputStreamWriter outputStreamWriter = new OutputStreamWriter(outputStream);
			outputStreamWriter.write(msgOrder);
			outputStreamWriter.flush();
			socket.shutdownOutput();
			
			BufferedReader br = new BufferedReader(new InputStreamReader(inputStream));
			StringBuffer stringBuffer = new StringBuffer();
			
			String response = null;
			while((response = br.readLine()) != null)
			{
				stringBuffer.append(response);
			}
			System.out.println(stringBuffer.toString());
			
			outputStreamWriter.close();
			outputStream.close();
			br.close();
			
			socket.close();
		} catch (UnknownHostException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
//			String response = HttpRequestProxy.send("http://127.0.0.1:10211", xmls);
//			System.out.println(response);

	}
	
}
