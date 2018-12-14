/************************************************************************
日  期：		2014-03-17
作  者:		周磊
版  本：     1.0
描  述:	    
历  史：      
************************************************************************/
package jetsennet.util;

import java.io.File;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.Writer;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.UnmarshalException;
import javax.xml.bind.Unmarshaller;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;

import com.google.gson.Gson;

public class ConvertUtil
{
    //json对象
    private static Gson gson = null;

    public static final String W3C_XML_SCHEMA_NS_URI = "http://www.w3.org/2001/XMLSchema";

    static
    {
        if (gson == null)
        {
            gson = new Gson();
        }
    }

    /**
     * 序列化（ObjectToString）
     * @param classToBeBound
     * @return
     * @throws Exception
     */
    public static <T> String serialize(T obj) throws Exception
    {
        String resultStr = null;
        Document doc = null;
        try
        {
            JAXBContext context = JAXBContext.newInstance(obj.getClass());
            Marshaller marshaller = context.createMarshaller();

            marshaller.setProperty(Marshaller.JAXB_ENCODING, "gb2312");//编码格式
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);//是否格式化生成的xml串   
            marshaller.setProperty(Marshaller.JAXB_FRAGMENT, true);//是否省略xml头信息（<?xml version="1.0" encoding="gb2312" standalone="yes"?>） 
            Writer outputWriter = new StringWriter();
            marshaller.marshal(obj, outputWriter);
            doc = DocumentHelper.parseText(outputWriter.toString());
        }
        catch (JAXBException ex)
        {
            throw ex;
        }
        if (!StringUtil.isNullOrEmpty(doc.asXML()))
        {
            resultStr = doc.asXML();
        }
        return resultStr;
    }

    /**
     * 反序列化（StringToObject）依赖于xsd
     * @param classToBeBound
     * @param serializedXml
     * @param schemaFileName
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public static <T> T deserialize(Class<T> classToBeBound, String serializedXml, String schemaFileName) throws Exception
    {
        T obj = null;
        if (StringUtil.isNullOrEmpty(serializedXml))
        {
            return obj;
        }
        try
        {
            JAXBContext context = JAXBContext.newInstance(classToBeBound);
            Unmarshaller unmarshaller = context.createUnmarshaller();

            SchemaFactory sf = SchemaFactory.newInstance(W3C_XML_SCHEMA_NS_URI);
            File schemaFile = new File("WebRoot\\WEB-INF\\classes\\jetsennet\\jwfm\\util\\" + schemaFileName + ".xsd");
            Schema schema = sf.newSchema(schemaFile);
            unmarshaller.setSchema(schema);
            obj = (T) unmarshaller.unmarshal(new StringReader(serializedXml));
        }
        catch (UnmarshalException ex)
        {
            throw ex;
        }
        return obj;
    }

    /**
     *  反序列化（StringToObject）不依赖于xsd
     * @param classToBeBound
     * @param serializedXml
     * @return
     * @throws Exception
     */
    @SuppressWarnings("unchecked")
    public static <T> T deserialize(Class<T> classToBeBound, String serializedXml) throws Exception
    {
        T obj = null;
        if (StringUtil.isNullOrEmpty(serializedXml))
        {
            return obj;
        }
        try
        {
            JAXBContext context = JAXBContext.newInstance(classToBeBound);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            obj = (T) unmarshaller.unmarshal(new StringReader(serializedXml));
        }
        catch (UnmarshalException ex)
        {
            throw ex;
        }
        return obj;
    }

    /**
     * 序列化(ObjectToJsonString)
     * @param obj
     * @return
     * @throws Exception
     */
    public static <T> String objectToJson(T obj) throws Exception
    {
        String jsonStr = null;
        try
        {
            if (gson != null)
            {
                jsonStr = gson.toJson(obj);
            }
        }
        catch (Exception ex)
        {
            throw ex;
        }
        return jsonStr;
    }

    /**
     * 反序列化（JsonStringToObject）
     * @param classToBeBound
     * @param jsonStr
     * @return
     * @throws Exception
     */
    public static <T> T jsonToObject(Class<T> classToBeBound, String jsonStr) throws Exception
    {
        T obj = null;
        if (StringUtil.isNullOrEmpty(jsonStr))
        {
            return obj;
        }
        try
        {
            if (gson != null)
            {
                obj = gson.fromJson(jsonStr, classToBeBound);
            }
        }
        catch (Exception ex)
        {
            throw ex;
        }
        return obj;
    }
}
