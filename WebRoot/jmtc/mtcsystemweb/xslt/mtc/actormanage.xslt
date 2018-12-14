<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabActormanage">
      <tr>
        <th scope="col" align="left" style="padding-left:10px;">
          名称
        </th>
        <th scope="col" align="center">
          IP地址
        </th>
        <th scope="col" align="center">
          端口
        </th>
        <th scope="col" align="center">
          状态
        </th>
        <th width="60px" scope="col" align="center">
          配置
        </th>
        <th width="60px" scope="col" align="center">
          监控
        </th>
        <th width="60px" scope="col" align="center">
          操作
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr onmousedown="setTrBgColor('tabActormanage',this)">

          <td align="left" style="padding-left:10px;">
            <xsl:value-of disable-output-escaping="no" select="SERVER_NAME" />
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no" select="HOST_IP" />
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no" select="HOST_PORT" />
          </td>
          <td align="center">
            <xsl:choose>
              <xsl:when test="WORK_STATE=0">空闲</xsl:when>
              <xsl:when test="WORK_STATE=3">任务执行中</xsl:when>
              <xsl:when test="WORK_STATE=10">停止</xsl:when>
              <xsl:when test="WORK_STATE=101">错误</xsl:when>
              <xsl:otherwise>
                未知
              </xsl:otherwise>
            </xsl:choose>

          </td>
          <td>
            <div class="look" onclick="window.location='worker.htm?serverId={SERVER_ID}&amp;sysid=53104000'">
              <div align="center" >
                <a href="#">
                  <span>配置</span>
                </a>
              </div>
            </div>
          </td>
          <td>
            <div class="look-1" onclick="window.location='workermonitor.htm?serverId={SERVER_ID}&amp;sysid=53105000'">
              <div align="center">
                <a href="#">监控</a>
              </div>
            </div>
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="WORK_STATE = 10">
                <div class="look-3" onclick="startActor('{HOST_IP}','{HOST_IP}','{HOST_PORT}');">
                  <div align="center">
                    <a href="#" >启动</a>
                  </div>
                </div>
              </xsl:when>
              <xsl:otherwise>

                <div class="look-2" onclick="stopActor('{HOST_IP}','{HOST_IP}','{HOST_PORT}')">
                  <div align="center">
                    <a href="#" >停止</a>
                  </div>
                </div>
              </xsl:otherwise>

            </xsl:choose>
          </td>
        </tr>
      </xsl:for-each>
    </table>
    <input type="hidden" value="{RecordSet/totalCount}" id="hid_TotalCount"></input>
  </xsl:template>
</xsl:stylesheet>