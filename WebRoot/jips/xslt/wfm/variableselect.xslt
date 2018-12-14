<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="98%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabFlow">
      <tr>   
        <th width="120px" align="left" scope="col" fieldname="VAR_NAME">
         <b>变量名称</b>
        </th>
        <th align="center" width="80px" scope="col" fieldname="VAR_TYPE">
          <b>变量类型</b>
        </th>
        <th  scope="col" width="120px" align="left" fieldname="VAR_VALUE">
          <b>缺省值</b>
        </th>
        <th scope="col" align="left" fieldname="VAR_DESC">
         <b>描述</b>
        </th> 
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr>       
          <td align="left">
              <xsl:value-of disable-output-escaping="no" select="VAR_NAME" />
          </td>
          <td>
            <xsl:choose>
              <xsl:when test ="VAR_TYPE=0">字符型</xsl:when>
              <xsl:when test ="VAR_TYPE=1">数值型</xsl:when>
              <xsl:when test ="VAR_TYPE=2">日期型</xsl:when>
            </xsl:choose>
          </td>
          <td align="left">
            <xsl:value-of disable-output-escaping="no" select="VAR_VALUE" />
          </td>
          <td align="left">
              <xsl:value-of disable-output-escaping="no" select="VAR_DESC" />
          </td>         
        </tr>
      </xsl:for-each>
    </table>     
  </xsl:template>
</xsl:stylesheet>
