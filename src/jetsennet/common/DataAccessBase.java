package jetsennet.common;

import jetsennet.sqlclient.*;

public class DataAccessBase {
	
  
    public DataAccessBase(ISqlExecutor sqlExecutor)
    {
        this.sqlExecutor = sqlExecutor;
    }

    private ISqlExecutor sqlExecutor;
    
   
    public ISqlExecutor getSqlExecutor()
    {
        return sqlExecutor;
    }
    public void setSqlExecutor(ISqlExecutor exec)
    {
         sqlExecutor = exec; 
    }
    
  
    public ISqlParser getSqlParser()
    {
         return sqlExecutor.getSqlParser();
    }
}
