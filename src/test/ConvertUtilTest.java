package test;

import java.util.List;

import jetsennet.ips.schema.JfMsgBean;
import jetsennet.ips.schema.JfMsgSuccess;
import jetsennet.util.ConvertUtil;

import org.junit.Before;
import org.junit.Test;

public class ConvertUtilTest {

	@Before
	public void setUp() throws Exception {
	}

	@Test
	public void testJsonToObject() {
		String jsonStr = "{\"responseHeader\":{\"message\":\"\",\"status\":0,\"QTime\":14102},\"data\":{\"success\":[{\"desc\":\"邮件表ver3\",\"name\":\"emailv3_123\",\"create\":true}]}}";
		try {
			JfMsgBean jsonToObject = ConvertUtil.jsonToObject(JfMsgBean.class, jsonStr);
			System.out.println(jsonToObject.getResponseHeader().getQTime());
			List<JfMsgSuccess> success = jsonToObject.getData().getSuccess();
			if(success.size() > 0)
			{
				for(JfMsgSuccess se : success)
				{
					System.out.println(se.getName());
					System.out.println(se.getDesc());
					System.out.println(se.getCreate());
					
				}
			}
			
//			ObjectMapper objectMapper = new ObjectMapper();
//			JfMsgBean readValue = objectMapper.readValue(jsonStr, JfMsgBean.class);
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
