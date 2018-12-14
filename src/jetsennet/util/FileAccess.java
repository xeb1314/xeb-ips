package jetsennet.util;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.StringWriter;

import sun.misc.BASE64Decoder;

public class FileAccess
{
    /**
     * 读文本文件
     * @param path 文件所在的全路径
     * @return 以UTF-8形式返回文件内容的字符串
     */
    public static String readFileText(String path)
    {
    	FileInputStream fStream = null;
    	InputStreamReader sReader = null;
    	StringWriter sWriter = null;
        try
        {
            fStream = new FileInputStream(path);
            sReader = new InputStreamReader(fStream, java.nio.charset.Charset.forName("utf-8"));
            sWriter = new StringWriter();
            char[] buf = new char[8096];
            int size = 0;
            while ((size = sReader.read(buf)) != -1) 
            {
                sWriter.write(buf, 0, size);
            }
            sWriter.close();
            sReader.close();
            fStream.close();
            return sWriter.toString();
        }
        catch (Exception ex) 
        {
            return "";
        }
        finally
        {
        	if (sWriter != null) 
            {  
                try 
                {  
                	sWriter.flush();
                	sWriter.close();  
                } 
                catch (IOException e) 
                {  
                	sWriter = null;
                }  
            }
        	if (sReader != null) 
            {  
                try 
                {  
                	sReader.close();  
                } 
                catch (IOException e) 
                {  
                	sReader = null;
                }  
            }  
        	if (fStream != null) 
            {  
                try 
                {  
                	fStream.close();  
                } 
                catch (IOException e) 
                {  
                	fStream = null;
                }  
            }  
        }
    }
    
    /**
     * 保存文件
     * @param targetPath 目录路径
     * @param content    文本内容
     * @return
     * @throws Exception
     */
    public static boolean saveFile(String targetPath,String content) throws Exception{
    	String pathDir = targetPath.substring(0, targetPath.lastIndexOf(File.separator));
    	FileOutputStream fWriter = null;
    	OutputStreamWriter writer = null;
        try
        {
        	File dirFile = new  File(pathDir);
            if (!(dirFile.exists()) && !(dirFile.isDirectory()))
            {
                dirFile.mkdirs();
            } 
            File file = new File(targetPath);
            if (file.exists()) {
                file.delete();
            }
            file.createNewFile();
        	fWriter = new FileOutputStream (targetPath);
        	writer = new OutputStreamWriter(fWriter, "UTF-8");  
        	writer.write(content, 0, content.length());
        }
        catch (Exception e)
        {
        	e.printStackTrace();
        }
        finally
        {
        	if (writer != null) 
            {  
                try 
                {  
                	writer.flush();
                	writer.close();  
                } 
                catch (IOException e) 
                {  
                	writer = null;
                }  
            }
        	if (fWriter != null) 
            {  
                try 
                {  
                	fWriter.flush();
                	fWriter.close();  
                } 
                catch (IOException e) 
                {  
                	fWriter = null;
                }  
            }  
        }
        return true;
    }
    
    /**
     * 保存文件
     * @param targetPath 目录路径
     * @param pictureBuffer    图片的base64编码内容
     * @return
     * @throws Exception
     */
    public static boolean saveFileByBase64(String targetPath,String pictureBuffer) throws Exception{
        File file = new File(targetPath);
        if (file.exists()) {
            file.delete();
        }
        file.createNewFile();
        OutputStream os = null;  
        try 
        {  
            BASE64Decoder decoder = new BASE64Decoder();
            os = new FileOutputStream(targetPath);  
            byte[] decoderBytes = decoder.decodeBuffer(pictureBuffer);
            for(int i=0, len = decoderBytes.length; i < len; ++i)
            {
                if (decoderBytes[i] < 0)
                {
                	//调整异常数据
                	decoderBytes[i]+=256;
                }
            }
            os.write(decoderBytes);  
        } 
        catch (Exception e) 
        {  
            e.printStackTrace();  
        } 
        finally 
        {  
            if (os != null) 
            {  
                try 
                {  
                	os.flush();
                    os.close();  
                } 
                catch (IOException e) 
                {  
                	os = null;
                }  
            }  
        }  

        return true;
    }
    
    /**
     * 删除文件
     * @param filepath
     * @throws Exception
     */
    public static void deleteFile(String filepath)throws Exception
    {
    	File dirFile = new  File(filepath);
        if (dirFile.isDirectory())
        {
        	File[] files = dirFile.listFiles();  
        	for(File file : files)
        	{
        		deleteFile(file.getPath());
        	}
        	dirFile.delete();
        }
        else 
        {
        	File file = new File(filepath);
            if (file.exists()) 
            {
                file.delete();
            }
            else
            {
                throw new java.io.FileNotFoundException(); 
            }
        }
        
    }
}
