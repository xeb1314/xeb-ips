<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8" />
	<xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabCtrlword">
			<tr>

				<th  scope="col" align="left" style="padding-left:10px;">名称</th>
				<th  scope="col">受控词码</th>
				<th  scope="col" align="left">说明</th>
				<th  scope="col" width="60px">修改</th>
				<th  scope="col" width="60px">删除</th>

			</tr>
			<xsl:for-each select="RecordSet/Record">
				<tr  class="rt" ondblclick="editCtrlword('{CW_ID}','{CW_TYPE}','{CW_NAME}','{CW_DESC}','{CW_CODE}');" onmousedown="setTrBgColor('tabCtrlword',this)">

					<td  align="left" style="padding-left:10px;">

						<xsl:value-of disable-output-escaping="no" select="CW_NAME" />

					</td>
					<td align="center">

						<xsl:value-of disable-output-escaping="no" select="CW_CODE" />

					</td>
					<td  align="left">
						<div class="cell-overflow-hidden">
							<xsl:value-of disable-output-escaping="no" select="CW_DESC" />
						</div>
					</td>
					<td align="center">
					
						 <div  class="see01" onclick="jetsennet.cancelEvent();editCtrlword('{CW_ID}','{CW_TYPE}','{CW_NAME}','{CW_DESC}','{CW_CODE}');"><span></span></div>
					</td>
					<td align="center">
					
						<div  class="see05" onclick="deleteCtrlWord('{CW_ID}');"><span>删除</span></div>
					</td>
				</tr>
			</xsl:for-each>
		</table>
		<input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
	</xsl:template>
</xsl:stylesheet>