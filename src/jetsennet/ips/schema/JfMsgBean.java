package jetsennet.ips.schema;

public class JfMsgBean {

	private JfMsgHead responseHeader;
	private JfMsgData data;
	public JfMsgHead getResponseHeader() {
		return responseHeader;
	}
	public void setResponseHeader(JfMsgHead responseHeader) {
		this.responseHeader = responseHeader;
	}
	public JfMsgData getData() {
		return data;
	}
	public void setData(JfMsgData data) {
		this.data = data;
	}
	
	
}
