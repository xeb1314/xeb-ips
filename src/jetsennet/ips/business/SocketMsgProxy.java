package jetsennet.ips.business;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.net.Socket;

import jetsennet.util.ConfigUtil;

public class SocketMsgProxy {

	public static String send(String url, int port, String content) throws Exception
	{
		Socket socket = null;
		OutputStream out = null;
		InputStream in = null;
		
		DataOutputStream dataOutputStream = null;
		InputStreamReader inStreamReader = null;
		String response = "";
		try {
			socket = new Socket(url, port);

			out = socket.getOutputStream();
			/*
			outputStreamWriter = new OutputStreamWriter(out);
			outputStreamWriter.write(4+content.getBytes().length);
			outputStreamWriter.write(content);
			outputStreamWriter.flush();
			*/
			
			dataOutputStream = new DataOutputStream(out);
			if(Boolean.parseBoolean(ConfigUtil.getProperty("msg.server.sizeHead")))
			{
				dataOutputStream.writeInt(content.getBytes().length);
			}
			
			dataOutputStream.write(content.getBytes());
			dataOutputStream.flush();
			

			in = socket.getInputStream();
			
			inStreamReader = new InputStreamReader(in);
			StringWriter sw = new StringWriter();
			char[] buf = new char[1024];
			int size = 0;
			
			while ((size = inStreamReader.read(buf)) != -1)
			{
				sw.write(buf, 0, size);
				break;
			}
			if(Boolean.parseBoolean(ConfigUtil.getProperty("msg.server.sizeHead")))
			{
				response = new String(sw.toString().getBytes(), 4, sw.toString().getBytes().length-6);
			}else response = sw.toString();

		}finally{
			try {
				dataOutputStream.close();
				out.close();
				in.close();
				inStreamReader.close();
				socket.close();
			} catch (IOException e) {
				throw e;
			}
		}
		
		return response;
	}
}
