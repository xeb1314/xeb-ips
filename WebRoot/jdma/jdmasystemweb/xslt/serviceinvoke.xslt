<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <xsl:for-each select="RecordSet/Record">
      <div>
        <b>请求地址：</b>
        <xsl:value-of disable-output-escaping="no" select="SERVICE_URL" />
      </div>
      <div>
        <b>请求方法：</b>
        <xsl:value-of disable-output-escaping="no" select="ACTION_NAME" />
      </div>
      <div>
        <b>请求描述：</b>
        <xsl:value-of disable-output-escaping="no" select="STATE_DESC" />
      </div>
      <div>
        <b>服务请求：</b>
      </div>
      <textarea  style="width: 100%;height: 100px" name="request{INVOKE_ID}" class="xml">
        <xsl:value-of disable-output-escaping="no" select="REQUEST_XML" />
      </textarea>
      <div>
        <b>服务响应：</b>
      </div>
      <textarea class="xml" style="width: 100%;height: 100px" name="request{INVOKE_ID}">
        <xsl:value-of disable-output-escaping="no" select="RESPONSE_XML"/>
      </textarea>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>