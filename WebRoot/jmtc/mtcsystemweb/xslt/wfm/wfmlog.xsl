<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" ID="tabFlow">
      <tr class="rt">
     <!--   <th align="center" width="40px" scope="col">
          	<input type="checkbox" onclick="jetsennet.form.checkAllItems('chk_CheckProcExec',this.checked)" id="chk_CheckProcExec-all"></input>
        </th> 
         -->
        <th nowarp="true"  scope="col" align="left" style="padding-left:10px;">
          <b>对象名称</b>
        </th>
        <th align="center" nowarp="true" scope="col">
          <b>所属流程</b>
        </th>
        <th  align="center" width="80px" scope="col">
          <b>创建用户</b>
        </th>
        <th  align="center" width="80px" scope="col">
          <b>流程状态</b>
        </th>
        <th  align="center" width="125px" scope="col">
          <b>开始时间</b>
        </th>
        <th  align="center" width="125px" scope="col">
          <b>结束时间</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="setTrBgColor('tabFlow',this)">
       <!--      <td  align="center"  title="流程({OBJ_ID})">
              <input type="checkbox" name="chk_CheckProcExec" value="{PROCEXEC_ID}" onclick="if(this.checked==false)el('chk_CheckProcExec-all').checked=false;"></input>
          </td>
         -->
          <td align="left" style="padding-left:10px;">
            <xsl:value-of disable-output-escaping="no" select="OBJ_NAME" />
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="no" select="PROC_NAME" />
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="no" select="START_USER" />
          </td>
          <td  align="center">
            <xsl:choose>             
              <xsl:when test="PROC_STATE=10">
                <font style="color:#2c597a">结束</font>
              </xsl:when>
              <xsl:when test="PROC_STATE=11">
                <font style="color:#fc2a3e">终止</font>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="PROC_STATE"></xsl:value-of>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td  align="center">
            <xsl:value-of disable-output-escaping="yes" select="translate(substring(START_TIME,0,20),'T',' ')" />
          </td>
          <td>
            <xsl:value-of disable-output-escaping="yes" select="translate(substring(END_TIME,0,20),'T',' ')" />
          </td>
        </tr>
      </xsl:for-each>
    </table>
      <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
