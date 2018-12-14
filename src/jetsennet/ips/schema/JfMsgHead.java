package jetsennet.ips.schema;

public class JfMsgHead {

	private String message;
	private String status;
	private long QTime;
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public long getQTime() {
		return QTime;
	}
	public void setQTime(long qTime) {
		QTime = qTime;
	}
}
