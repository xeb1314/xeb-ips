/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：test.JFClient.java
 * 日 期：2015年4月1日 下午3:34:43
 * 作 者：刘紫荣
 */
package test;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月1日       刘紫荣            创建<br/>
 */

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Random;
import java.util.UUID;
import org.iipg.hurricane.client.HConnException;
import org.iipg.hurricane.client.HConnFactory;
import org.iipg.hurricane.client.HConnection;
import org.iipg.hurricane.client.metadata.HCriteria;
import org.iipg.hurricane.client.metadata.HDocument;
import org.iipg.hurricane.client.metadata.HDocumentList;
import org.iipg.hurricane.client.metadata.HQuery;
import org.iipg.hurricane.client.metadata.HQueryFactory;
import org.iipg.hurricane.client.response.QueryResponse;
import org.iipg.hurricane.client.response.UpdateResponse;
import org.iipg.hurricane.client.util.AssistantTool;

public class JFClient
{
  private static SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
  private static Random seed = new Random();
  private static String SCHEMA_NAME = "email";
  private HConnection conn;

  public JFClient()
  {
    this.conn = null; }

  public void init(String configName) {
    this.conn = HConnFactory.getInstance(configName);
  }

  public void insert() {
    HDocumentList docs = new HDocumentList();
    for (int i = 0; i < 10; ++i) {
      HDocument doc = null;
      try {
        doc = buildRecord();
      }
      catch (ParseException e) {
        e.printStackTrace();
      }
      catch (UnsupportedEncodingException e) {
        e.printStackTrace();
      }
      docs.add(doc);
      System.out.println(doc.getValue("messageid"));
    }
    try {
      this.conn.add(docs);
    }
    catch (HConnException e) {
      e.printStackTrace();
    }
  }

  public void queryByID(String id) {
    HCriteria crit = new HCriteria();

    crit.addSelectField("messageid");
    crit.addSelectField("fromaddr");
    crit.addSelectField("toaddr");
    crit.addSelectField("subject");
    crit.addSelectField("reader");
    crit.addSelectField("readtime");
    crit.addSelectField("attachmentdata");

    crit.addEqualTo("messageid", id);

    HQuery q = HQueryFactory.newQuery(SCHEMA_NAME, crit);

    QueryResponse resp = null;
    try {
      resp = this.conn.query(q);
    }
    catch (HConnException e) {
      e.printStackTrace();
    }

    HDocumentList list = resp.getResults();
    AssistantTool.printResultSet(list);
  }

  public void queryByKeyword() {
    HCriteria crit = new HCriteria();

    crit.addSelectField("messageid");
    crit.addSelectField("fromaddr");
    crit.addSelectField("toaddr");
    crit.addSelectField("subject");
    crit.addSelectField("reader");
    crit.addSelectField("readtime");
    crit.addSelectField("attachmentdata");

    crit.setQStr("content:会计");

    crit.addOrderByDescending("readtime");

    crit.setRowCount(3);

    HQuery q = HQueryFactory.newQuery(SCHEMA_NAME, crit);

    QueryResponse resp = null;
    try {
      resp = this.conn.query(q);
    }
    catch (HConnException e) {
      e.printStackTrace();
    }

    HDocumentList list = resp.getResults();
    System.out.println("Total match " + resp.getTotalCount() + " rows.");
    AssistantTool.printResultSet(list);
  }

  public void queryByTime(String qTime) {
    HCriteria crit = new HCriteria();

    crit.addSelectField("messageid");
    crit.addSelectField("fromaddr");
    crit.addSelectField("toaddr");
    crit.addSelectField("subject");
    crit.addSelectField("reader");
    crit.addSelectField("readtime");
    crit.addSelectField("attachmentdata");
    try
    {
      crit.addGreaterOrEqualThan("readtime", sdf.parse(qTime));
    }
    catch (ParseException e1) {
      e1.printStackTrace();
    }

    crit.addOrderByDescending("readtime");

    crit.setRowCount(3);

    HQuery q = HQueryFactory.newQuery(SCHEMA_NAME, crit);

    QueryResponse resp = null;
    try {
      resp = this.conn.query(q);
    }
    catch (HConnException e) {
      e.printStackTrace();
    }

    HDocumentList list = resp.getResults();
    System.out.println("Total match " + resp.getTotalCount() + " rows.");
    AssistantTool.printResultSet(list);
  }

  public void updateByID(String id) {
    HDocument doc = new HDocument();
    doc.setSchema(SCHEMA_NAME);

    doc.setField("messageid", id);
    doc.setField("reader", "anonymous user");
    doc.setField("readtime", new Date(System.currentTimeMillis()));
    try
    {
      UpdateResponse response = this.conn.update(doc);
      System.out.println("Affected " + response.getRows() + " rows.");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void deleteByID(String id) {
    HDocument doc = new HDocument();
    doc.setSchema(SCHEMA_NAME);

    doc.setField("messageid", id);
    try
    {
      UpdateResponse response = this.conn.delete(doc);
      System.out.println("Affected " + response.getRows() + " rows.");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  public void close() {
    this.conn.close();
  }

  public static void main(String[] args) {
    long start = System.currentTimeMillis();

    if (args.length < 1) {
      printUsage();
      System.exit(0);
    }

    JFClient app = new JFClient();
    app.init("config.client");

    String cmd = args[0];

    if ("insert".equalsIgnoreCase(cmd)) {
      System.out.println("-------------------------------------");
      System.out.println("Insert 10 records.");
      app.insert();
    } else if ("queryByKeyword".equalsIgnoreCase(cmd)) {
      System.out.println("\n\nQuery for content:会计");
      System.out.println("-------------------------------------");
      app.queryByKeyword();
    } else if ("queryByTime".equalsIgnoreCase(cmd)) {
      String currentTime = sdf.format(new Date(System.currentTimeMillis() - 86000000L));
      System.out.println("\n\nQuery for readtime>='" + currentTime + "'");
      System.out.println("-------------------------------------");
      app.queryByTime(currentTime);
    } else if ("getByID".equalsIgnoreCase(cmd)) {
      System.out.println("\n\nQuery for ID : " + args[1]);
      System.out.println("-------------------------------------");
      app.queryByID(args[1]);
    } else if ("update".equalsIgnoreCase(cmd)) {
      System.out.println("\n\nUpdate for ID : " + args[1]);
      System.out.println("-------------------------------------");
      app.updateByID(args[1]);
    } else if ("delete".equalsIgnoreCase(cmd)) {
      System.out.println("\n\nDelete for ID : " + args[1]);
      System.out.println("-------------------------------------");
      app.deleteByID(args[1]);
    } else if ("getHBlob".equalsIgnoreCase(cmd)) {
      System.out.println("\n\nGet HBlob for ID : " + args[1] + " - " + args[2]);
      System.out.println("-------------------------------------");
      app.getHBlob(args[1], args[2]);
    } else {
      System.out.println("Unknown command: " + cmd);
      printUsage();
    }

    app.close();
    long used = System.currentTimeMillis() - start;
    System.out.println("use " + used + " ms.");
    System.exit(0);
  }

  private void getHBlob(String id, String itemID) {
    HCriteria crit = new HCriteria();
    crit.addEqualTo("uid", id);
    crit.addEqualTo("item", itemID);

    HQuery q = HQueryFactory.newQuery(SCHEMA_NAME, crit);

    QueryResponse resp = null;
    try {
      resp = this.conn.getBinary(q);
      HDocumentList list = resp.getResults();
      HDocument doc = list.get(0);
      byte[] buf = doc.getBinary();
      System.out.println(new String(buf, "gbk"));
    }
    catch (HConnException e) {
      e.printStackTrace();
    }
    catch (UnsupportedEncodingException e) {
      e.printStackTrace();
    }
  }

  private void saveToFile(byte[] buf) {
    File f = new File("test.dat");
    try {
      FileOutputStream out = new FileOutputStream(f);
      out.write(buf);
      out.close();
      System.out.println("Write to file: " + f.getAbsolutePath());
    }
    catch (FileNotFoundException e) {
      e.printStackTrace();
    }
    catch (IOException e) {
      e.printStackTrace();
    }
  }

  private static void printUsage() {
    System.out.println("Usage: demo [options]");
    System.out.println("Options:\n\tinsert                Insert new record.\n\tqueryByKeyword        Query by fixed keyword.\n\tquerByTime            Query by time condition. (1 day before)\n\tgetByID [id]          Query by given id.\n\tupdate [id]           Update record for given id.\n\tdelete [id]           Delete record for given id.\n\tgetHBlob [id itemID]  Get HBlob from given record.\n");
  }

  private HDocument buildRecord()
    throws ParseException, UnsupportedEncodingException
  {
    HDocument doc = new HDocument();
    doc.setSchema(SCHEMA_NAME);

    doc.setField("messageid", UUID.randomUUID().toString());
    doc.setField("fromaddr", "58同城简历 <mailservice@58.com>");

    doc.addField("toaddr", "wwang369@163.com");
    doc.addField("toaddr", "abc@abc.com");
    doc.addField("toaddr", "test@test.com");

    doc.setField("senddate", sdf.parse("2011-11-16 04:43:48"));
    doc.setField("subject", "会计/会计师-（现职位）会计/会计师-58.com");
    doc.setField("content", "应聘职位：会计/会计师。 请通过简历中的电话或邮件联系我。（请勿直接回复邮件）");

    doc.setField("attachnames", "简历.doc,照片.jpeg");

    doc.setField("attach", "我是一个对生活充满希望、积极向上的青年,对待朋友能以诚相待,对工作态度执着、细心、责任心强、勤奋好学、认真负责、吃苦耐劳、勇于迎接新挑战,能够快速进入团队角色、配合团队完成目标");
    doc.setField("reader", "zhangsan");
    doc.setField("readtime", new Date(System.currentTimeMillis()));

    byte[] buf = "58同城简历 <mailservice@58.com> wwang369@163.com 2011-11-16T04:43:48Z 会计/会计师-（现职位）会计/会计师-58.com应聘职位：会计/会计师。 请通过简历中的电话或邮件联系我。（请勿直接回复邮件）".getBytes();
    doc.setBField("emaildata", buf);

    buf = "简历.doc 示例".getBytes("gbk");
    doc.addBField("attachmentdata", buf);
    buf = "照片.jpeg 示例".getBytes("gbk");
    doc.addBField("attachmentdata", buf);

    return doc;
  }
}