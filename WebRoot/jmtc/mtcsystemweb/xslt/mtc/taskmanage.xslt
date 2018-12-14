<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="99%" border="0" cellpadding="0" cellspacing="0" id="tabTask">
      <tr>
        <td scope="col" align="left" style="padding-left:10px;" sortfield="TASK_NAME"><b>任务名称</b></td>
        <td scope="col" width="150px" align="left" sortfield="TASK_TYPE"><b>任务类型</b></td>
        <td scope="col" width="100px" align="left" sortfield="TASK_STATE"><b>任务状态</b></td>
        <td scope="col" width="80px" align="center" sortfield="TASK_LEVEL"><b>优先级</b></td>
        <td scope="col" width="150px" align="center" sortfield="CREATE_TIME"><b>任务接收时间</b></td>
        <td scope="col" width="150px" align="center" sortfield="START_TIME"><b>任务执行开始时间</b></td>
        <td scope="col" width="150px" align="center" sortfield="END_TIME"><b>任务执行结束时间</b></td>
        <td scope="col" width="200px" align="left" sortfield="STATE_DESC"><b>任务状态描述信息</b></td>
        <td scope="col" width="70px" align="center"><b>优先级设置</b></td>
        <td scope="col" width="45px" align="center"><b>详情</b></td>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr>
          <td align="left" style="padding-left:10px;">
            <xsl:value-of disable-output-escaping="no" select="TASK_NAME" />
          </td>
          <!-- <td>
            <xsl:choose>
              <xsl:when test="TASK_STATE &lt; 100 or TASK_STATE = 100">
                <div class="look-1" onclick="viewTask('{TASK_ID}');" style="display:none" title="详情">
                  <span>详情</span>
                </div>
              </xsl:when>
              <xsl:otherwise>
                <div class="look-1" onclick="viewTasklog('{TASK_ID}');" style="display:none" title="详情">
                  <span>详情</span>
                </div>
              </xsl:otherwise>
            </xsl:choose>
          </td>
          <td>
            <xsl:if test="TASK_STATE &lt; 100 or TASK_STATE = 100">
              <div class="see3" onclick="setTaskLevel('{TASK_ID}');" style="display:none" title="调整优先级">
                <span>调整优先级</span>
              </div>
            </xsl:if>
          </td>
          <td>
            <xsl:if test="TASK_STATE &lt; 100 or TASK_STATE = 100">
              <div class="see05" onclick="deleteTask('{TASK_ID}');" style="display:none" title="删除">
                <span>删除</span>
              </div>
            </xsl:if>
          </td>
          <td>
            <xsl:if test="EXEC_MODE=10 or EXEC_MODE=30">
              <xsl:choose>
                <xsl:when test="TASK_STATE &lt; 100">
                  <div class="look-1" onclick="viewSubTask('{TASK_ID}');" style="display:none">
                    <span>子任务</span>
                  </div>
                </xsl:when>
                <xsl:otherwise>
                  <div class="look-1" onclick="viewSubTaskLog('{TASK_ID}');" style="display:none">
                    <span>子任务</span>
                  </div>
                </xsl:otherwise>
              </xsl:choose>
            </xsl:if>

          </td> -->
          <td align="left">
            <xsl:value-of select="TASK_TYPE"/>
          </td>
          <td align="center">
            <xsl:choose>
<!--               <xsl:when test="TASK_STATE=0">有依赖</xsl:when>
 -->              <xsl:when test="TASK_STATE=0 or TASK_STATE=1 or TASK_STATE=2">新任务</xsl:when>
             <!--  <xsl:when test="TASK_STATE=2">等待执行</xsl:when> -->
              <xsl:when test="TASK_STATE=100">
                执行中
                <xsl:if test ="TASK_PERCENT!=0">
                  (
                  <xsl:value-of select="TASK_PERCENT"/>
                  %)
                </xsl:if>
              </xsl:when>
              <xsl:when test="TASK_STATE=101">执行中(异常)</xsl:when>
              <xsl:when test="TASK_STATE=200">成功</xsl:when>
              <xsl:when test="TASK_STATE=210 or TASK_STATE=220 or TASK_STATE=230 or TASK_STATE=240 or TASK_STATE=250 or TASK_STATE=500">
                <font color='red'>失败</font>
              </xsl:when>
              <!-- <xsl:when test="TASK_STATE=220">停止</xsl:when>
              <xsl:when test="TASK_STATE=230">错误，可重试</xsl:when>
              <xsl:when test="TASK_STATE=240">暂停</xsl:when>
              <xsl:when test="TASK_STATE=250">中止</xsl:when>
              <xsl:when test="TASK_STATE=500">删除</xsl:when> -->
              <xsl:otherwise>
                <xsl:value-of select="TASK_STATE"></xsl:value-of>
              </xsl:otherwise>

            </xsl:choose>
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no" select="TASK_LEVEL" />
          </td>
          <td align="center">
            <xsl:value-of select='translate(substring(CREATE_TIME,0,20),"T"," ")' ></xsl:value-of>
          </td>
          <td align="center">
              <xsl:choose>
                <xsl:when test="TASK_STATE=1 or TASK_STATE=2">
                 --
                </xsl:when>
              <xsl:otherwise>
                 <xsl:if test ="START_TIME!=''">
                   <xsl:value-of select='translate(substring(START_TIME,0,20),"T"," ")' ></xsl:value-of>
                 </xsl:if>
                 <xsl:if test ="START_TIME=''">
                   --
                 </xsl:if>
              </xsl:otherwise>
	          </xsl:choose>
          </td>
          <td align="center">
	          <xsl:choose>
	            <xsl:when test="TASK_STATE=200 or TASK_STATE=210">
	              <xsl:value-of select='translate(substring(END_TIME,0,20),"T"," ")' ></xsl:value-of>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td align="left">
          	 <xsl:choose>
	            <xsl:when test="STATE_DESC!=''">
	              <xsl:value-of disable-output-escaping="no" select="STATE_DESC" />
	            </xsl:when>
	            <xsl:when test="TASK_STATE=220">
	            <span>停止任务</span>
	            </xsl:when>
	            <xsl:otherwise>--</xsl:otherwise>
	          </xsl:choose>
          </td>
          <td>
            <xsl:if test="TASK_STATE &lt; 100">
              <div class="jetsen-grid-body-inner" title="调整优先级">
                <span style="cursor:pointer;" onclick="setTaskLevel('{TASK_ID}','{TASK_LEVEL}');">
                	<img src="../images/cel_config.png"/>
                </span>
              </div>
            </xsl:if>
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="TASK_STATE &lt; 100 or TASK_STATE = 100">
                 <div class="jetsen-grid-body-inner" title="详情">
                     <span  style="cursor:pointer;" onclick="viewTask('{TASK_ID}');">
                     <img src="../images/cel_info.png"/>
                     </span>
                 </div>
              </xsl:when>
              <xsl:otherwise>
              <div class="jetsen-grid-body-inner" title="详情">
                     <span  style="cursor:pointer;" onclick="viewTasklog('{TASK_ID}');">
                     <img src="../images/cel_info.png"/>
                     </span>
                 </div>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>