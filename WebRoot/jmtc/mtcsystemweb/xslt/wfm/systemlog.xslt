<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8" />
	<xsl:template match="/">
		<table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" id="tabSystemlog">
			<tr class="rt">
				<th scope="col" style="width:40px;">
					<input type="checkbox" id="chk-all" onclick="jetsennet.form.checkAllItems('chkSystemLog',this.checked)"/>
				</th>				
				<th scope="col" align="left">日志描述</th>
        <th scope="col" style="width:50px;"></th>
        <th scope="col" style="width:100px;">日志级别</th>
        <th scope="col" style="width:150px;">时间</th>				
			</tr>
			<xsl:for-each select="RecordSet/Record">
				<tr class="rt">
					<td align="center">
						<input type="checkbox" name="chkSystemLog" value="{ID}" onclick="if(this.checked==false)el('chk-all').checked=false;"></input>
					</td>							
					<td align="left">
						<xsl:value-of select='DESCRIPTION' ></xsl:value-of>
					</td>
          <td>
            <xsl:if test="(LOG_LEVEL=3 or LOG_LEVEL=4) and LOG_INFO !=''">
              <div class="look-1" onclick="viewLogDetail('{ID}');" style="display:none">
                <span>详情</span>
              </div>
            </xsl:if>
          </td>
          <td align="center">
            <xsl:choose>
              <xsl:when test="LOG_LEVEL=1">调试</xsl:when>
              <xsl:when test="LOG_LEVEL=2">信息</xsl:when>
              <xsl:when test="LOG_LEVEL=3">警告</xsl:when>
              <xsl:when test="LOG_LEVEL=4">错误</xsl:when>
              <xsl:otherwise></xsl:otherwise>
            </xsl:choose>
          </td>
          <td align="center">
            <xsl:value-of select='translate(substring(LOG_TIME,0,20),"T"," ")' ></xsl:value-of>
          </td>          
				</tr>
			</xsl:for-each>
		</table>
		<input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
	</xsl:template>
</xsl:stylesheet>