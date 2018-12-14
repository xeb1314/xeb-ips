<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xsl:output method="html" encoding="UTF-8" />
  <xsl:template match="/">
    <xsl:for-each select="Service/ServiceMethods/ServiceMethod">
      <div id="div{MethodName}_Soap" style="display:none">
        <div>
          <b>服务方法描述：</b>
          <xsl:value-of disable-output-escaping="no" select="MethodDesc" />
        </div>
        <div>
          <b>SOAP请求与响应：</b>
          <input type="button" value="测试" onclick="testMethod('{MethodName}');"  class="button" ></input>
        </div>
        <div>
          <b>SOAPAction：</b>
          <xsl:value-of disable-output-escaping="no" select="SoapAction" />
        </div>
        <textarea  name="code{MethodName}" class="xml">
          <xsl:value-of disable-output-escaping="no" select="MethodInput" />
        </textarea>
        <br/>
        <textarea class="xml"  name="code{MethodName}">
          <xsl:value-of disable-output-escaping="no" select="MethodOutput"/>
        </textarea>
      </div>
      <div style="display: none;position: absolute" id="div{MethodName}">
        <div id="divSubFrame{MethodName}" style="" >
        <form class="form-horizontal mg-lg">
          <div id="divTop{MethodName}" class="form-group" style="overflow:auto; height: 260px">
            <div class="jetsen-tabs">
              <ul class="jetsen-tabul">
                <li class="jetsen-tabon" style="background-color: #357ebd;" onclick="jetsennet.util.tabpaneEvent(this,'divParam{MethodName}','jetsen-tab');">
                  服务参数
                </li>
                <xsl:if test ="count(HeadParams/HeadParam)>0">
                  <li class="jetsen-taboff" style="background-color: #357ebd;" onclick="jetsennet.util.tabpaneEvent(this,'divParam{MethodName}','jetsen-tab');">
                    消息头
                  </li>
                </xsl:if>
              </ul>
              <div class="jetsen-tabtable" id="divParam{MethodName}">
                <div class="jetsen-tabbodyon">
                  <xsl:if test ="count(MethodParams/MethodParam)>0">
                    <table width="95%" style="margin-left: 10px" class="table-info">
                      <colgroup>
                        <col class="width-8w" />
                        <col width="auto"/>
                      </colgroup>
                      <xsl:for-each select="MethodParams/MethodParam">
                        <tr>
                          <td class="field-head">
                            <xsl:value-of disable-output-escaping="no" select="ParamName" />
                            <br/>(<xsl:value-of disable-output-escaping="no" select="ParamType"/>)
                          </td>
                          <td>
                            <xsl:choose>
                              <xsl:when test="(ParamType='string' or IsComplexParam='true') and count(../MethodParam)&lt;5">
                                <textarea name="txtParam{../../MethodName}" paramType="{ParamType}"  class="textarea"></textarea>
                              </xsl:when>
                              <xsl:otherwise>
                                <input name="txtParam{../../MethodName}" paramType="{ParamType}"  class="input4"></input>
                              </xsl:otherwise>
                            </xsl:choose>
                          </td>
                        </tr>
                      </xsl:for-each>
                    </table>
                  </xsl:if>
                </div>
                <xsl:if test ="count(HeadParams/HeadParam)>0">
                  <div class="jetsen-tabbodyoff">
                    <table width="100%">
                      <xsl:for-each select="HeadParams/HeadParam">
                        <tr>
                          <td>
                            <xsl:value-of disable-output-escaping="no" select="HeadName" />：
                            <table width="95%"  style="margin-left: 10px" class="table-info">
                              <colgroup>
                                <col class="width-8w" />
                                <col width="auto"/>
                              </colgroup>
                              <xsl:for-each select="HeadFields/HeadField">
                                <tr>
                                  <td class="field-head">
                                    <xsl:value-of disable-output-escaping="no" select="ParamName" />
                                    <br/>(<xsl:value-of disable-output-escaping="no" select="ParamType" />)
                                  </td>
                                  <td>
                                    <input id="txtHead{../../../../MethodName}{../../HeadName}{ParamName}" headName="{../../HeadName}" paramType="{ParamType}" paramName="{ParamName}" class="input4"></input>
                                  </td>                                  
                                </tr>
                              </xsl:for-each>
                            </table>
                          </td>
                        </tr>
                      </xsl:for-each>
                    </table>
                  </div>
                </xsl:if>
              </div>
            </div>
          </div>
          <div class="form-group">
			<label for="txt_DeviceName" >服务测试结果:</label>
			<div >       
          		<textarea  id="txtResult{MethodName}" class="xml" style="width: 100%;height: 150px"></textarea>
          	</div>
          </div>
          </form>
        </div>
      </div>
    </xsl:for-each>
  </xsl:template>
</xsl:stylesheet>