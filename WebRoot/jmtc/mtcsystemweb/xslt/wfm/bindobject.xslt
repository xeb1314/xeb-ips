<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" ID="tabFlow">
      <tr class="rt">
   
        <th nowarp="true"  width="80px" scope="col">
          <b>类型ID</b>
        </th>
        <th align="left" nowarp="true" scope="col">
           <b>类型名称</b>
        </th>        
        <th  align="center" width="60px" scope="col">
           <b>变量</b>
        </th>
         <th  align="center" width="60px" scope="col">
            <b>编辑</b>
        </th>
         <th  align="center" width="60px" scope="col">
            <b>删除</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="setTrBgColor('tabFlow',this)" ondblclick="editBindObject({PROC_TYPE});">
       
          <td>          
              <xsl:value-of disable-output-escaping="no" select="PROC_TYPE" />
          </td>
          <td align="left" >
              <xsl:value-of disable-output-escaping="no" select="TYPE_NAME" />
          </td>           
           <td align="center">
            <div  class="see07" onclick="loadVariable('{PROC_TYPE}');">
              <span>变量</span>
            </div>
          </td>
          <td align="center">
            <div  class="see01" onclick="editBindObject('{PROC_TYPE}');">
              <span>编辑</span>
            </div>
          </td>
          <td align="center">
            <div  class="see05" onclick="deleteBindObject('{PROC_TYPE}');">
              <span>删除</span>
            </div>
          </td>
         
        </tr>
      </xsl:for-each>
    </table>
      <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
