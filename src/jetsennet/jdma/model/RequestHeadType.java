package jetsennet.jdma.model;

public class RequestHeadType {
	private String sourceCodeField;

    private String targetCodeField;

    private String requestIDField;

    private String userNameField;

    private String userTokenField;

	public String getSourceCode() {
		return sourceCodeField;
	}

	public void setSourceCode(String sourceCodeField) {
		this.sourceCodeField = sourceCodeField;
	}

	public String getTargetCode() {
		return targetCodeField;
	}

	public void setTargetCode(String targetCodeField) {
		this.targetCodeField = targetCodeField;
	}

	public String getRequestID() {
		return requestIDField;
	}

	public void setRequestID(String requestIDField) {
		this.requestIDField = requestIDField;
	}

	public String getUserName() {
		return userNameField;
	}

	public void setUserName(String userNameField) {
		this.userNameField = userNameField;
	}

	public String getUserToken() {
		return userTokenField;
	}

	public void setUserToken(String userTokenField) {
		this.userTokenField = userTokenField;
	}
}
