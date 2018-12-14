<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8" />
	<xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabSysClassType">
			<tr>
				<th  scope="col" width="100px" >类型编号</th>
				<th  scope="col">名称</th>
				<th  scope="col">描述</th>
				<th  scope="col" width="60px">修改</th>
			</tr>
			<xsl:for-each select="RecordSet/Record">
				<tr  class="rt" ondblclick="editClassType('{CLASS_ID}','{CLASS_TYPE}','{CLASS_NAME}','{CLASS_DESC}');" onmousedown="setTrBgColor('tabSysClassType',this)" >
					
					<td align="center">
						<xsl:value-of disable-output-escaping="no" select="CLASS_TYPE" />
					</td>
					<td align="center">
						<xsl:value-of disable-output-escaping="no" select="CLASS_NAME" />
					</td>
					<td align="center">
						<xsl:value-of disable-output-escaping="no" select="CLASS_DESC" />
					</td>
					<td align="center">
						 <div  class="see01" onclick="jetsennet.cancelEvent();editClassType('{CLASS_ID}','{CLASS_TYPE}','{CLASS_NAME}','{CLASS_DESC}')"></div>
					</td>
				</tr>
			</xsl:for-each>
		</table>
		<input type="hidden" value="{RecordSet/totalCount}" id="hid_SysClassCount"></input>
	</xsl:template>
</xsl:stylesheet>