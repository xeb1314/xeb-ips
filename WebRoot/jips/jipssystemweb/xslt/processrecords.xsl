<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema"> 
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
   <table width="99%" border="0" cellpadding="0" cellspacing="0" id="processTab">
      <tr>
        <td   scope="col" align="left" >
          <b>节点名称</b>
        </td>
        <td  width="120px" scope="col" align="left">
          <b>执行者</b>
        </td>
           <td width="100px" scope="col"  align="center" >
          <b>原始状态</b>
        </td>
    
        <td width="100px" scope="col"  align="center" >
          <b>结束状态</b>
        </td>
    
        <td width="130px" scope="col"  align="center">
          <b>开始时间</b>
        </td>
        <td width="130px" scope="col"  align="center">
          <b>结束时间</b>
        </td>
    
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr>
         <td  align="left">
            <xsl:value-of disable-output-escaping="no" select="LONG_NAME" />
          </td>
           <td  align="left">
            <xsl:value-of disable-output-escaping="no" select="EXECUTE_USER" />
          </td>
              <td  align="center">
   
                  <xsl:choose>
              <xsl:when test="OLD_STATE=0">
                <font style="color:#388fc8">准备中</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=1">
                <font style="color:#faa827">等待执行</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=2">
            
                  <font style="color:green">
                    执行中
                  </font>
            
             
              </xsl:when>
              <xsl:when test="OLD_STATE=3">
                <font style="color:#aeb1ae">执行结束</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=4">
                <font style="color:#0d8612">打回</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=5">
                <font style="color:red">被打回</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=6">
                <font style="color:#f8fa3e">强制结束</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=7">
                <font style="color:fc2a3e">暂停</font>
              </xsl:when>
              <xsl:when test="OLD_STATE=10">
                <font style="color:#fc2a3e">执行失败</font>
              </xsl:when>
              <xsl:otherwise>
                
              </xsl:otherwise>
            </xsl:choose>
          </td>
             <td  align="center">
   
            
             <xsl:choose>
              <xsl:when test="OVER_STATE=0">
                <font style="color:#388fc8">准备中</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=1">
                <font style="color:#faa827">等待执行</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=2">
            
                  <font style="color:green">
                    执行中
                  </font>
            
             
              </xsl:when>
              <xsl:when test="OVER_STATE=3">
                <font style="color:#aeb1ae">执行结束</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=4">
                <font style="color:#0d8612">打回</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=5">
                <font style="color:red">被打回</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=6">
                <font style="color:#f8fa3e">强制结束</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=7">
                <font style="color:fc2a3e">暂停</font>
              </xsl:when>
              <xsl:when test="OVER_STATE=10">
                <font style="color:#fc2a3e">执行失败</font>
              </xsl:when>
              <xsl:otherwise>
                
              </xsl:otherwise>
            </xsl:choose>
          </td>
            <td  align="center">
            <xsl:value-of disable-output-escaping="yes" select="translate(substring(START_TIME,0,20),'T',' ')" />
          </td>
          <td  align="center">
              <xsl:value-of disable-output-escaping="yes" select="translate(substring(END_TIME,0,20),'T',' ')" />
          </td>
   
        </tr>
      </xsl:for-each>
    </table>
   <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>   
  </xsl:template>
</xsl:stylesheet>
