<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
	<xsl:output method="html" encoding="UTF-8" />
	<xsl:template match="/">
		<table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabTasklog">
			<colgroup>
				<col width="auto"></col>
				<col width="130px"></col>
				<col width="150px"></col>
				<col width="120px"></col>
				<col width="130px"></col>
				<col width="130px"></col>
				<col width="auto"></col>
				<col width="70px"></col>
				<col width="70px"></col>
			</colgroup>
			<tr class="rt">
				<th scope="col" align="left" style="padding-left:10px;">任务名称</th>
				<th scope="col" align="center">执行器</th>
				<th scope="col">任务类型</th>
				<th scope="col">任务状态</th>
				<th scope="col">创建时间</th>
				<th scope="col">完成时间</th>
				<th scope="col" align="left">描述</th>
				<th scope="col">详情</th>
				<th scope="col">子任务</th>
			</tr>
			<xsl:for-each select="RecordSet/Record">
				<tr class="rt" onmousedown="setTrBgColor('tabTasklog',this)">

					<td align="left" style="padding-left:10px;">
						<xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
					</td>
					<td align="center">
						<xsl:value-of disable-output-escaping="no" select="TASK_ACTOR" />
					</td>
					<td align="center">
						  <xsl:value-of select="TASK_TYPE"/>
					</td>
					<td align="center">
						<xsl:choose>
							<xsl:when test="TASK_STATE=0">有依赖</xsl:when>
							<xsl:when test="TASK_STATE=1">新任务</xsl:when>
							<xsl:when test="TASK_STATE=2">等待执行</xsl:when>
							<xsl:when test="TASK_STATE=100">执行中</xsl:when>
							<xsl:when test="TASK_STATE=200">成功</xsl:when>
							<xsl:when test="TASK_STATE=210">
								<font color='red'>失败</font>
							</xsl:when>
							<xsl:when test="TASK_STATE=220">停止</xsl:when>
							<xsl:when test="TASK_STATE=230">错误，可重试</xsl:when>
							<xsl:when test="TASK_STATE=240">暂停</xsl:when>
							<xsl:when test="TASK_STATE=250">中止</xsl:when>
							<xsl:when test="TASK_STATE=500">删除</xsl:when>
							<xsl:otherwise>
								<xsl:value-of select="TASK_STATE"></xsl:value-of>
							</xsl:otherwise>
						</xsl:choose>
					</td>
					<td align="center">
						<xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
					</td>
					<td align="center">
						<xsl:value-of select='translate(substring(END_TIME,0,20),"T"," ")' ></xsl:value-of>
					</td>
					<td align="left">
						<xsl:value-of select='STATE_DESC' ></xsl:value-of>
					</td>
					<td>
						<div class="look-1" onclick="viewTasklog('{TASK_ID}');">
							<span>详情</span>
						</div>
					</td>
					<td>
						<xsl:if test="EXEC_MODE=10 or EXEC_MODE=30">
							<div class="look-1" onclick="viewSubTask('{TASK_ID}');">
								<span>子任务</span>
							</div>
						</xsl:if>
					</td>
				</tr>
			</xsl:for-each>
		</table>
		<input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
	</xsl:template>
</xsl:stylesheet>