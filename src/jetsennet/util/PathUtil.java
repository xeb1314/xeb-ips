/************************************************************************
日  期：		2012-09-25
作  者:		李小敏
版  本：      1.0
描  述:	    
历  史：      
 ************************************************************************/
package jetsennet.util;

import java.net.URLDecoder;

/**
 * java类获取web应用布置的相关
 */
public class PathUtil {

    public static void main(String[] args) throws Exception {
        System.out.println(PathUtil.getWebRoot());
    }
     
    /**
     * 取J2EE标准中的classes路径
     * @return
     */
    public static String getWebClassesPath() {
        String path = PathUtil.class.getProtectionDomain().getCodeSource()
                .getLocation().getPath();
        return path;
    }
    
    /**
     * 取J2EE标准中的WEB-INF路径
     * @return
     * @throws IllegalAccessException
     */
    public static String getWebInfPath() throws Exception {
        String path = getWebClassesPath();
        if (path.indexOf("WEB-INF") > 0) {
            path = path.substring(0, path.indexOf("WEB-INF") + 8);
            path = URLDecoder.decode(path, "UTF-8");
        } else {
            throw new IllegalAccessException("路径获取错误");
        }
        return path;
    }
    
    /**
     * 取J2EE标准中的WebRoot路径
     * @return
     * @throws IllegalAccessException
     */
    public static String getWebRoot() throws Exception {
        String path = getWebClassesPath();
        if (path.indexOf("WEB-INF") > 0) {
            path = path.substring(0, path.indexOf("WEB-INF/classes"));
            path = URLDecoder.decode(path, "UTF-8");
        } else {
            throw new IllegalAccessException("路径获取错误");
        }
        return path;
    }
    
    /**
     * 合并路径
     * @param path 起始路径
     * @param path1 合并路径
     * @return 
     */
    public static String combine(String path,String path1){
        //path = path.replaceAll("\\\\", "/");
        if (path.endsWith("/")){
            return path + path1;
        }else{
            return path +"/"+ path1;
        }
    }
}