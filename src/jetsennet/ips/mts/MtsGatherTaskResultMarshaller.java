/* 
 * Copyright (c) 北京捷成世纪科技股份有限公司. All Rights Reserved.
 * 文件：jetsennet.ips.mts.MtsTaskResultMarshaller.java
 * 日 期：2015年4月8日 上午10:38:30
 * 作 者：刘紫荣
 */
package jetsennet.ips.mts;

import org.dom4j.Document;
import org.dom4j.DocumentHelper;
import org.dom4j.Element;

/**
 *  TODO 添加该类的简单功能说明以及算法
 *
 * @author <a href="mailto:liuzirong@jetsen.com">刘紫荣</a>
 * @version 1.0.0
 * ＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝<br/>
 * 修订日期                 修订人            描述<br/>
 * 2015年4月8日       刘紫荣            创建<br/>
 */
public class MtsGatherTaskResultMarshaller extends BaseCommandMarshaller {

	/* (non-Javadoc)
	 * @see jetsennet.ips.mts.BaseCommandMarshaller#getCommandType()
	 */
	@Override
	public byte getCommandType() {
		// TODO Auto-generated method stub
		return CommandTypes.MTS_GATHERTASK_RESULT;
	}

	/* (non-Javadoc)
	 * @see jetsennet.ips.mts.BaseCommandMarshaller#createCommand()
	 */
	@Override
	public ICommand createCommand() {
		// TODO Auto-generated method stub
		return new MtsGatherTaskResult();
	}

	/* (non-Javadoc)
	 * @see jetsennet.ips.mts.BaseCommandMarshaller#marshal(jetsennet.ips.mts.IMtsFormat, jetsennet.ips.mts.ICommand)
	 */
	@Override
	public String marshal(IMtsFormat format, ICommand command) {
		// TODO Auto-generated method stub
		return null;
	}

	/* (non-Javadoc)
	 * @see jetsennet.ips.mts.BaseCommandMarshaller#unmarshal(jetsennet.ips.mts.IMtsFormat, jetsennet.ips.mts.ICommand, java.lang.String)
	 */
	@Override
	public void unmarshal(IMtsFormat format, ICommand command,
			String commandText) throws Exception {
		// TODO Auto-generated method stub
		MtsGatherTaskResult mtsTaskResult = (MtsGatherTaskResult) command;
		Document doc = DocumentHelper.parseText(commandText);
		if (doc != null)
		{
			Element element = doc.getRootElement().element("mtsGatherTaskResult");
			mtsTaskResult.setAmount(Double.parseDouble(element.elementTextTrim("amount")));
			mtsTaskResult.setTaskID(element.elementText("taskID"));
			mtsTaskResult.setPath(element.elementText("path"));
			mtsTaskResult.setStatTime(element.elementText("statTime"));
		}
	}

}
