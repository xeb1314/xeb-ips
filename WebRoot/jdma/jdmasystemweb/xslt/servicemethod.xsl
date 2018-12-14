<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <table border="0" class="nogrid" width="98%" cellspacing="0" cellpadding="0">
      <xsl:for-each select="RecordSet/Record">
        <tr onmouseover="this.className='title'"  onmouseout="this.className='';" style="border:0px">
          <td width="98%" onclick="serviceMethodSelected('{METHOD_NAME}',this)" >
            <xsl:value-of disable-output-escaping="no" select="METHOD_NAME" />
          </td>
          <td align="right">
            <input type="checkbox" value="{METHOD_NAME}" name="checkMethod" style="border:none"></input>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>
</xsl:stylesheet>