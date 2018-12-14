<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" ID="tabFlow">
      <tr class="rt">
   
        <th nowarp="true"  scope="col">
         <b>名称</b>
        </th>
        <th align="center" nowarp="true" scope="col">
           <b>类型</b>
        </th>
        <th  align="center"  scope="col">
         <b>描述</b>
        </th>
         <th  align="center" width="60px" scope="col">
            <b>删除</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="setTrBgColor('tabFlow',this)" ondblclick="editVariable({VAR_ID});">
       
          <td>
              <xsl:value-of disable-output-escaping="no" select="VAR_NAME" />
          </td>
          <td>
              <xsl:choose>
                <xsl:when test ="VAR_TYPE=0">字符型</xsl:when>
                <xsl:when test ="VAR_TYPE=1">数值型</xsl:when>
                <xsl:when test ="VAR_TYPE=2">日期型</xsl:when>
              </xsl:choose>
          </td>
          <td>
              <xsl:value-of disable-output-escaping="no" select="VAR_DESC" />
          </td>         
          <td align="center">

            <div  class="see05" onclick="deleteVariable('{VAR_ID}');">
              <span>删除</span>
            </div>
          </td>
         
        </tr>
      </xsl:for-each>
    </table>
      <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
