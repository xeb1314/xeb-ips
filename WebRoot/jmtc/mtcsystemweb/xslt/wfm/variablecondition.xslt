<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table border="0" cellpadding="0" cellspacing="0" ID="tabFlowCondition">
      <tr>
        <th  scope="col" width="120px" align="left">
         <b>变量名称</b>
        </th>
        <th align="center" width="100px" scope="col">
           <b>变量类型</b>
        </th>
        <th  align="center" width="100px" scope="col">
         <b>操作</b>
        </th>
         <th  align="center" width="100px" scope="col">
            <b>变量值</b>
        </th>
        <th align="center" width="60px" scope="col">
            <b>编辑</b>
        </th>
        <th  align="center" width="60px" scope="col">
            <b>删除</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr>
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
              <xsl:value-of disable-output-escaping="no" select="OPERATE" />
          </td>         
           <td title="{VAR_VALUE}">
              <xsl:value-of disable-output-escaping="no" select="VAR_VALUE" />
          </td>
          <td align="center">
            <div class="jetsen-grid-body-inner" title="编辑">
               <span style="cursor:pointer;" onclick="setVariableParam('{VAR_NAME}','{VAR_TYPE}','{OPERATE}');">
               		<img src="../images/edit.png" style="height:18px;"/>
               </span>
            </div>
          </td>
          <td align="center">
             <div class="jetsen-grid-body-inner" title="删除">
               <span style="cursor:pointer;" onclick="delConditionVariable()"><img src="../images/cel_del.png" style="height:18px;"/></span>
            </div>
          </td>
        </tr>
      </xsl:for-each>
    </table>
      <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
