<%@ page language="java" import="java.util.*"%>

<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>PLANTER Tree Viewer</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />

        <!-- A link to a jQuery UI ThemeRoller theme, more than 22 built-in and many more custom -->
     
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/jquery-ui-1.11.4.custom/jquery-ui.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/free_jqgrid_4.14.1/css/ui.jqgrid.min.css" /> 
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/font-awesome-4.5.0/css/font-awesome.min.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/css/jqgrid_settings.css?version=2" />
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/css/toolbar.css" />
        <link rel="stylesheet" type="text/css" media="screen" href="/js/treeViewer/css/msa.css" />
        <link rel="stylesheet" type="text/css" media="screen"href="/js/treeViewer/css/style.css">   
        <link rel="stylesheet" type="text/css" media="screen" href="/js/w2ui-1.4.1/w2ui-1.4.1.css" />        
    </head>
    <body>
        
      
    <div id="toolbar"></div>
    <table id="treeviewer"><tr><td /></tr></table>
    <canvas id="msa_check"></canvas>
    <BR>
    <table  id="legend"></table>

<!--    <script type="text/javascript" src="/js/googleAnalytics.js"></script>-->
    <script type="text/ecmascript" src="/js/treeViewer/jquery_1.12.0/jquery-1.12.0.min.js"></script>
    <script type="text/ecmascript" src="/js/treeViewer/jquery-ui-1.11.4.custom/jquery-ui.min.js"></script>    
    <script type="text/javascript" src="/js/treeViewer/free_jqgrid_4.14.1/js/jquery.jqgrid.min.js"></script>    
    <script type="text/ecmascript" src="/js/treeViewer/free_jqgrid_4.14.1/js/grid.locale-en.min.js"></script>
    <script type="text/ecmascript" src="/js/treeViewer/jqgrid_settings.js"></script>

    <script type="text/javascript" src="/js/jshashtable/jshashtable-3.0.js"></script>
    <script type="text/javascript" src="/js/x2js-v1.0.11/xml2json.js"></script>
    <script type="text/ecmascript" src="/js/w2ui-1.4.1/w2ui-1.4.1.js"></script>
 

<!--    <script type="text/ecmascript" src="/js/treeViewer/msa.js"></script>
    <script type="text/ecmascript" src="/js/treeViewer/rowTopHeight.js"></script>
    <script type="text/ecmascript" src="/js/treeViewer/defaultColorPreferences.js"></script>   
    <script type="text/ecmascript" src="/js/treeViewer/node.js"></script>  
    <script type="text/ecmascript" src="/js/treeViewer/tree.js"></script>  
    <script type="text/ecmascript" src="/js/treeViewer/treeViewer.js"></script>-->
            

    <script type="text/ecmascript" src="/js/treeViewer/msa.min.js?version=4"></script>
    <script type="text/ecmascript" src="/js/treeViewer/rowTopHeight.js?version=2"></script>
    <script type="text/ecmascript" src="/js/treeViewer/defaultColorPreferences.js?version=2"></script>   
    <script type="text/ecmascript" src="/js/treeViewer/node.min.js?version=2"></script>  
    <script type="text/ecmascript" src="/js/treeViewer/tree.min.js?version=3"></script>  
    <script type="text/ecmascript" src="/js/treeViewer/treeViewer.min.js?version=7"></script>



    <script language="javascript">
        window.name="PlanterTAV";
    </script>    
    </body>
</html>

