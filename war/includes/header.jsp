<%@ page contentType="text/html;charset=ISO-8859-1"%>
<%
	String title = request.getParameter("title");
        if (title == null) {
		title = "";
	}
%>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1"/>


    <title><%=title%></title>
        <link href="/bootstrap-4.0.0-beta.3-dist/css/bootstrap.min.css" rel="stylesheet">       
  </head>
  <body>
<nav class="navbar navbar-expand-lg navbar-light bg-light">
  <a class="navbar-brand" href="#">Home</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
    <span class="navbar-toggler-icon"></span>
  </button>

  <div class="collapse navbar-collapse" id="navbarSupportedContent">

  </div>
</nav>      

    <div class="navbar-wrapper">
      <div class="container">


      <div class="header clearfix">
        <nav>

        </nav>
          <center><h2 class="text-muted">Planter: The Plant Genome Database</h2></center>
      </div>

      </div>
    </div>
