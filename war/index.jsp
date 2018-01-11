<%@ page language="java" import="java.util.*, edu.usc.ksom.pm.panther.pantherdb.logic.FamilyUtil,edu.usc.ksom.pm.panther.pantherdb.dataModel.Family" %>
<jsp:include page="/includes/header.jsp" flush="true">
	<jsp:param name="title" value="Planter Home Page"/>
</jsp:include>
<%
    List<Family> famList = FamilyUtil.getFamilies();
    if (null == famList || 0 == famList.size()) {
%>
<div class="card">
        No Trees available for viewing now, please try later.  
    </h5>
    <p>
        Planter is developed by the <a href="https://sites.google.com/usc.edu/thomaslab"> Thomas lab at USC </a>
    </p>    
</div>
<%
    }
%>
<BR>
<div class="card">
    <div class="card-body">
        <h5 class="card-title">Planter trees</h5>
        <h6 class="card-subtitle mb-2 text-muted">View Planter trees by clicking on the links below</h6>

            <table class="table">
            <%
                int numCols = 5;
                for (int i = 0; i < famList.size(); i++) {
                    Family fam = famList.get(i);
                    String acc = fam.getAccession();
                    if (0 == (i % numCols)) {
            %>
                    <TR>
            <%
                    }
            %>
            <TD><a href="/treeViewer/treeViewer.jsp?book=<%=acc%>" target="_blank" ><%=acc%></a></TD>
            <%
                    if (0 == ((i + 1) % numCols)) {
            %>
                    </TR>
            <%    
                    }
                }
            %>    
            </table>
    </div>
</div>
<div class="container">
    <p>
        Planter is developed by the <a href="https://sites.google.com/usc.edu/thomaslab"> Thomas lab at USC </a>
    </p>

</div>
<jsp:include page="/includes/footer.jsp" flush="true"/>

