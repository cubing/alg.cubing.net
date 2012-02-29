<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en-GB">
<head>
     <title>Cube Tools</title>
     <?php include($_SERVER['DOCUMENT_ROOT']."/site/include.php");?>
</head>
<body>

<?php site_header("cube", "none");?>
<br>
<font size="6">Miscellaneous Tools for the Serious Cuber</font>
<br><br>
<hr>
<div>
<a name="firefoxsearch"><font size="5">Firefox Algorithm &quot;Search&quot;</font></a><br>
-Type an algorithm in the Firefox search bar to animate it in your browser.<br><br>
<script
type="text/javascript">
<!--
function errorMsg()
{
alert("Netscape 6 or Mozilla is needed to install a sherlock plugin");
}
function addEngine(name,img,cat,type)
{

if ((typeof window.sidebar == "object") && (typeof
window.sidebar.addSearchEngine == "function"))
{
//cat="Web";
//cat=prompt('In what category should this engine be installed?','Web')
window.sidebar.addSearchEngine(
"http://alg.garron.us/"+name+".src",
"http://cube.garron.us/tools/"+img+".png", name, cat );
}
else
{
errorMsg();
}
}

//-->
</script>

<a href="javascript:addEngine('algsearch','alg','Tools',0)">Alg Search</a><br>
-Will display searched algorithm <u>as applied to a solved cube</u>.<br>
-Use for scrambling, and to find the effect of an algorithm.<br><br><br>
<a href="http://garron.us/archive/vid/demo/algsearch.mp4">Demo Video</a>
<hr>

</div>


<?php site_footer("August 25, 2009");?>
</body>
</html>
