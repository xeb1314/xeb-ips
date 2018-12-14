<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" ID="tabFlow">
      <tr class="rt">
   
        <th nowarp="true"  width="80px" scope="col">
          <b>ID</b>
        </th>
        <th align="left" width="150px" nowarp="true" scope="col">
           <b>名称</b>
        </th>
        <th align="center" width="150px" scope="col">
           <b>类型</b>
        </th>
        <th align="center" width="150px" scope="col">
          <b>分类</b>
        </th>
        <th  align="left" scope="col">
           <b>描述</b>
        </th>      
        <th  align="center" scope="col" width="100px">
           <b>节点执行能力</b>
        </th>      
         <th  align="center" width="60px" scope="col">
            <b>编辑</b>
        </th>
         <th  align="center" width="60px" scope="col">
            <b>删除</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="setTrBgColor('tabFlow',this)" ondblclick="editActivity({ACT_ID});">
       
          <td align="center">          
              <xsl:value-of disable-output-escaping="no" select="ACT_ID" />
          </td>                     
          <td align="left">
              <xsl:value-of disable-output-escaping="no" select="ACT_NAME" />
          </td>
          <td>
            <xsl:choose>
              <xsl:when test ="ACT_TYPE=1">人工节点</xsl:when>
              <xsl:when test ="ACT_TYPE=2">自动节点</xsl:when>
              <xsl:when test ="ACT_TYPE=3">策略节点</xsl:when>
              <xsl:when test ="ACT_TYPE=10">顺序流</xsl:when>
              <xsl:when test ="ACT_TYPE=11">条件</xsl:when>
              <xsl:when test ="ACT_TYPE=12">并行</xsl:when>
              <xsl:when test ="ACT_TYPE=13">侦听</xsl:when>
              <xsl:when test ="ACT_TYPE=14">循环</xsl:when>
            </xsl:choose>
          </td>
           <td align="center">
              <xsl:value-of disable-output-escaping="no" select="CW_NAME" />
          </td> 
          <td align="left">
              <xsl:value-of disable-output-escaping="no" select="ACT_DESC" />
          </td>        
          <td align="center">
          	<xsl:choose>
	           <xsl:when test ="ACT_TYPE=2">
	              <xsl:value-of disable-output-escaping="no" select="CONCURRENT_NUM" />
	           </xsl:when>
            </xsl:choose>
          </td>        
          <td align="center">
            <div  class="see01" onclick="editActivity('{ACT_ID}');">
              <span>编辑</span>
            </div>
          </td>
          <td align="center">
            <div  class="see05" onclick="deleteActivity('{ACT_ID}');">
              <span>删除</span>
            </div>
          </td>
         
        </tr>
      </xsl:for-each>
    </table>
      <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
