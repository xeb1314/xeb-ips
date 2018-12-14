<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="99%" border="0" cellpadding="0" cellspacing="0" ID="tabTask">
      <tr>
        <th  nowarp="true"   align="center" >
          <b>任务名称</b>
        </th>
        <th width="120px"  align="center" >
          <b>任务类型</b>
        </th>
        <th width="100px"   align="center">
          <b>执行者</b>
        </th>
        <th width="150px"   align="center">
          <b>任务执行开始时间</b>
        </th>
        <th width="150px"   align="center">
          <b>任务执行结束时间</b>
        </th>
 		<th width="100px"   align="center" >
          <b>任务状态</b>
        </th>
        <th width="150px"  align="center" >
          <b>状态描述</b>
        </th>
        <th width="45px"  align="center" >
          <b>结果查看</b>
        </th>
        <th width="45px"  align="center" >
          <b>流程查看</b>
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="procTaskToCount({PROC_ID})" ondblclick="viewProcess('{PROCEXEC_ID}',{PROC_ID},this.getAttribute('objName'),'{START_USER}','{translate(substring(CREATE_TIME,0,20),'T',' ')}',{PROC_TYPE },'{OBJ_ID}','{PROC_STATE}')">
          <xsl:attribute name ="objName">
            <xsl:value-of disable-output-escaping="no" select="OBJ_NAME" />
          </xsl:attribute>
          <td align="left" title="{OBJ_NAME}">
            <xsl:value-of disable-output-escaping="no" select="OBJ_NAME" />
          </td>
          <td align="left">
            <xsl:value-of disable-output-escaping="no" select="PROCACT_NAME" />
          </td>
          <td  align="center">
            <xsl:choose>
	            <xsl:when test="EXECUTE_USER!=''">
            		<xsl:value-of disable-output-escaping="no" select="EXECUTE_USER" />
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td  align="center">
             <xsl:choose>
	            <xsl:when test="START_TIME!=''">
	              <xsl:value-of select='translate(substring(START_TIME,0,20),"T"," ")' ></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td  align="center">
             <xsl:choose>
	            <xsl:when test="TASK_STATE=3 or TASK_STATE=6">
	              <xsl:value-of disable-output-escaping="yes" select="translate(substring(END_TIME,0,20),'T',' ')" />
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td  align="center">
            <xsl:choose>
              <xsl:when test="TASK_STATE=0">
                <font style="color:#388fc8">未就绪</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=1">
                <font style="color:#faa827">等待</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=2">
                <xsl:if test ="TASK_PERCENT>0">
                  <font style="color:green">
                    执行中(<xsl:value-of disable-output-escaping="no" select="TASK_PERCENT" />%)
                  </font>
                </xsl:if>
                <xsl:if test ="TASK_PERCENT&lt;=0 or TASK_PERCENT=''">执行中</xsl:if>
              </xsl:when>
              <xsl:when test="TASK_STATE=3">
                <font style="color:#aeb1ae">结束</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=4">
                <font style="color:#0d8612">打回</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=5">
                <font style="color:red">被打回</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=6">
                <font style="color:#f8fa3e">强制结束</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=7">
                <font style="color:fc2a3e">暂停</font>
              </xsl:when>
              <xsl:when test="TASK_STATE=10">
                <font style="color:#fc2a3e">错误</font>
              </xsl:when>
              <xsl:otherwise>
                --
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td title="{TASK_DESC}">
              <xsl:choose>
	            <xsl:when test="TASK_DESC!=''">
		            <xsl:value-of disable-output-escaping="no" select="TASK_DESC"></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td>
             <div class="jetsen-grid-body-inner" title="结果查看">
                     <span style="cursor:pointer;" onclick="">
                     	<img src="images/cel_info.png"/>
                     </span>
                 </div>
          </td>
          <td>
             <div class="jetsen-grid-body-inner" title="查看:流程({OBJ_ID})">
                     <span style="cursor:pointer;"  onclick="viewProcess('{PROCEXEC_ID}',{PROC_ID},this.getAttribute('objName'),'{START_USER}','{translate(substring(CREATE_TIME,0,20),'T',' ')}',{PROC_TYPE },'{OBJ_ID}','{PROC_STATE}')">
                         <img src="images/cel_info.png"/>
                     </span>
                 </div>
          </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>
