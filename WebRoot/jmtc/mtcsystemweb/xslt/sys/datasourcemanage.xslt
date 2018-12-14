<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table width="100%" border="0" cellpadding="0" cellspacing="1" class="table" id="tabDatasource">
      <tr>

        <th  scope="col" align="left" style="padding-left:10px;">
          数据源名称
        </th>
        <th  scope="col">
          类型
        </th>
        <th  scope="col">
          地址
        </th>
        <th  scope="col">
          数据库
        </th>
        <th  scope="col">
          用户名
        </th>       
        <th  scope="col" width="60px">
          编辑
        </th>
        <th  scope="col" width="60px">
          删除
        </th>
      </tr>
      <xsl:for-each select="RecordSet/Record">
        <tr  class="rt" ondblclick="editDatascoure('{SRC_ID}','{SRC_NAME}','{DB_TYPE}','{DB_URL}','{DB_NAME}','{DB_USER}','{DB_PASSWORD}');" onmousedown="setTrBgColor('tabDatasource',this)">

          <td  align="left" style="padding-left:10px;">
            <xsl:value-of disable-output-escaping="no" select="SRC_NAME" />
          </td>
          <td align="center">
              <xsl:value-of disable-output-escaping="no" select="DB_TYPE" />
          </td>
          <td align="center">           
              <xsl:value-of disable-output-escaping="no" select="DB_URL" />
          </td>
          <td align="center">
            <xsl:value-of disable-output-escaping="no" select="DB_NAME" />
          </td>
          <td align="center">
              <xsl:value-of disable-output-escaping="no" select="DB_USER" />
          </td>
          <td align="center">
            <div  class="see01" onclick="editDatascoure('{SRC_ID}','{SRC_NAME}','{DB_TYPE}','{DB_URL}','{DB_NAME}','{DB_USER}','{DB_PASSWORD}');">
              <span>修改</span>
            </div>
          </td>
          <td align="center">
            <div  class="see05" onclick="deleteDatascoure('{SRC_ID}');">
              <span>删除</span>
            </div>
          </td>
        </tr>
      </xsl:for-each>
    </table>   
  </xsl:template>
</xsl:stylesheet>