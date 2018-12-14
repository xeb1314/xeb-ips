<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="table datalist" ID="tabTask">
      <tr class="rt">  
        <th align="center" width="40px" scope="col">
          <input type="checkbox" id="chk-Task-all" onclick="jetsennet.form.checkAllItems('chk-Task',this.checked);jetsennet.cancelEvent(true);" />
        </th>    
        <th nowarp="true" align="left">
          <b>任务名称</b>
        </th>
        <th width="120px" align="center">
          <b>任务类型</b>
        </th>
        <th  width="120px">
          <b>创建用户</b>
        </th>
        <th align="center" width="150px">
          <b>创建时间</b>
        </th> 
        <th align="center" width="150px">
          <b>修改时间</b>
        </th>  
        <th align="center">
          <b>描述</b>
        </th>
        <th align="center" width="45">
          <b>删除</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr id="trTask{TASK_ID}" position="{position()}" ondblclick="editTask();" onmousedown="selTask(this);">
          <xsl:attribute name ="taskId">
            <xsl:value-of disable-output-escaping="no" select="TASK_ID" />
          </xsl:attribute>
          <xsl:attribute name ="taskName">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </xsl:attribute>
          <xsl:attribute name ="taskDesc">
            <xsl:value-of disable-output-escaping="no" select="TASK_DESC" />
          </xsl:attribute>
          <xsl:attribute name ="createUser">
            <xsl:value-of disable-output-escaping="no" select="CREATE_USER" />
          </xsl:attribute>
          <xsl:attribute name ="createUserId">
            <xsl:value-of disable-output-escaping="no" select="CREATE_USERID" />
          </xsl:attribute>
          <xsl:attribute name ="createTime">
            <xsl:value-of disable-output-escaping="no" select="CREATE_TIME" />
          </xsl:attribute>
          <xsl:attribute name ="taskType">
            <xsl:value-of disable-output-escaping="no" select="TASK_TYPE" />
          </xsl:attribute>
          <xsl:attribute name ="classId">
            <xsl:value-of disable-output-escaping="no" select="CLASS_ID" />
          </xsl:attribute>
          <td  align="center" >
              <input type="checkbox" name="chk-Task" value="{TASK_ID}" onclick="if(this.checked==false)el('chk-Task-all').checked=false;">
              </input>
          </td>
          <td align="left" title="{TASK_NAME}">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </td>
          <td align="center">
				<xsl:choose>
					<xsl:when test="TASK_TYPE=10">
						<font>数据处理任务</font>
					</xsl:when>
					<xsl:when test="TASK_TYPE=20">
						<font>数据采集任务</font>
					</xsl:when>
					<xsl:otherwise>
						<xsl:value-of disable-output-escaping="no" select="TASK_TYPE"/>
					</xsl:otherwise>
				</xsl:choose>
			</td>
          <td>
            <xsl:value-of disable-output-escaping="no" select="CREATE_USER" />
          </td>
          <td  align="center">
             <xsl:choose>
	            <xsl:when test="CREATE_TIME!=''">
	              <xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>         
          <td  align="center">
            <xsl:choose>
	            <xsl:when test="UPDATE_TIME!=''">
	              <xsl:value-of select='translate(substring(UPDATE_TIME,0,20),"T"," ")' ></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>       
          <td>
            <xsl:value-of disable-output-escaping="no" select="TASK_DESC" />
          </td>
          <td align="center">
          	<span style="cursor:pointer;" onclick="delTask('{TASK_ID}');">
          		<img src="images/cel_del.png"></img>
          	</span>
		  </td>  
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
