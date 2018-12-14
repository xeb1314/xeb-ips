<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table cellspacing="0" border="0"  cellpadding="1" style="width:98%;" ID="tabServiceLog">
      <tr>
        <td width="30px" align="center" >
          <input type="checkbox" onclick="checkAllLog(this.checked)" id="chkCheckAll"></input>
        </td>
        <td align="center" sortfield="ACTION_NAME">
          <b>请求操作</b>
        </td>
        <td align="center" sortfield="USER_NAME" width="200px">
          <b>请求用户</b>
        </td>
        <td align="center" width="130px" sortfield="REQUEST_TIME">
          <b>请求时间</b>
        </td>
        <td align="center" width="130px" sortfield="RESPONSE_TIME">
          <b>响应时间</b>
        </td>
        <td align="center">
          <b>描述</b>
        </td>
        <td width="60px" align="center" >
          <b>状态</b>
        </td>
        <td align="center" width="50px">
          <b>查看</b>
        </td>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr ondblclick="viewServiceInvoke('{INVOKE_ID}')">
          <td align="center">
            <input type="checkbox" name="chkServiceLog" onclick="$('chkCheckAll').checked=false;" value="{INVOKE_ID}"></input>
          </td>
          <td align="center">
            <div class="cell-overflow-hidden">
              <xsl:value-of disable-output-escaping="no" select="ACTION_NAME" />
            </div>
          </td>
          <td align="center">
            <div class="cell-overflow-hidden">
              <xsl:value-of disable-output-escaping="no" select="USER_NAME" />
            </div>
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no"  select="translate(substring(REQUEST_TIME,1,19),'T',' ')" />
          </td>
          <td align="center" >
            <xsl:value-of disable-output-escaping="no"  select="translate(substring(RESPONSE_TIME,1,19),'T',' ')" />
          </td>
          <td>
          <!-- onMouseOut="jetsennet.hidetip()" onMouseOver="jetsennet.tooltip(this.getAttribute('statedesc'))" -->
            <div class="cell-overflow-hidden" >
              <xsl:attribute name ="statedesc">
                <xsl:value-of disable-output-escaping="no" select="STATE_DESC" />
              </xsl:attribute>
              <xsl:value-of disable-output-escaping="no" select="substring(STATE_DESC,0,30)" />
            </div>
          </td>
          <td align="center" >
            <xsl:if test="STATE=0">
              正常
            </xsl:if>
            <xsl:if test="STATE=1">
              <span style="color:red">错误</span>
            </xsl:if>
          </td>
          <td align="center">
            <a href="javascript:void(0)" onclick="viewServiceInvoke('{INVOKE_ID}')">
              <img border="0" src="images/cel_info.png"/>
            </a>
          </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/Record1/TotalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>