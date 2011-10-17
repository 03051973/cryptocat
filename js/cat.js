var seed = Math.seedrandom();

var p = str2bigInt(
	"C41F45CE6AA3AEB23A9202F8152779A4E42223354306AE1DC3BCC95568518345" + 
	"80A65E95D6EACA6845EA6DD53E21E01AEE47B58A20E02DCC092337B6D41BDF24" + 
	"EB04A96C0C83F39E08EA00604A9E4D6D0E78E1515F89C2822AB96C6AD78D8364" + 
	"EDFCC788C28CAA234A17807119C6ECD43CDF5210347E59145B7B8E37B497A617" + 
	"A7CBA65CCE00BBA7693D9DECE37EF9D185689A2E6B2FCCF97830520FE2859863" + 
	"CD370DE738C417B52320D728CFCA51808946A5DA1A94E5D27EFF02B607F178AC" + 
	"CCB8237D8A756B918B22E1A88F5162CB2557F665889D56E18C622355AEEF2B83" + 
	"4F0876E6B7CD0FD7B5C98AE6C27787BED4725394F0052D79159409EEFEED5861" + 
	"96DBF39EDEB01507E1F99922B1EA1FB1B3ECF99820596A2F28EEE0AA136909F6" + 
	"CEA12199207CA8348637473207611A7E97351C4B326FE69A32FFB2F98B3E52F9" + 
	"EED788B34A5208D67C0E613AA8D21277A84BE24A5B2B5C8FD4E7BE4F53815DBD" + 
	"B1A413C8EC99C47A530657D8C178DDD09E0F6D76C938504B0E59E7D6500E47BC" + 
	"456C2C798F6898E1889DEABFAF39EF1147FD6705B85288C3156C307ECA33C3DE" + 
	"9830AF6C261FCC11A760A809EF83633F32BD8BAF3339E7537F81F5BC1FE0158B" + 
	"D4AE88D99C7EA8C19117D2DFE39775A3D0BA00CDFB244D36EF8AEABFB111C5FF" + 
	"3771B3BAF8AFBAA33C1D1AF159FD577902A3DC600813EB83C93BAF4CB394C6D3", 
16);

var g = str2bigInt("2", 10);
var t, num, interval, sound, errored, reconnect, prikey, pubkey, nickset, error, tag, sentid, flood;
t = num = interval = sound = errored = reconnect = pos = tag = flood = 0;
var fingerprints = new Array();
var names = new Array();
var keys = new Array();
var seckeys = new Array();
var queue = new Array();
var nick = $("#nick").html();
var name = $("#name").html();
var soundEmbed = null;
var focus = true;

function idSelect(id) {
	document.getElementById(id).focus();
	document.getElementById(id).select();
}

function scrolldown() {
	$("#chat").animate({scrollTop: document.getElementById("chat").scrollHeight + 20}, 820);
}

function getstamp(nick) {
	var time = new Date();
	var h = time.getHours();
	var m = time.getMinutes();
	var spaces = "";
	for (si=0; si < (nick.length - 5); si++) {
		spaces += "&#160;";
	}
	if (String(h).length == 1) {
		h = "0" + String(h);
	}
	if (String(m).length == 1) {
		m = "0" + String(m);
	}
	return spaces + h + ":" + m;
}

function soundPlay(which) {
	function createSound(which) {
		soundEmbed = document.createElement("audio");
		soundEmbed.setAttribute("src", which);
		soundEmbed.setAttribute("style", "display: none;");
		soundEmbed.setAttribute("autoplay", true);
	}
	if (!soundEmbed) {
		createSound(which);
	}
	else {
		document.body.removeChild(soundEmbed);
		soundEmbed.removed = true;
		soundEmbed = null;
		createSound(which);
	}
	soundEmbed.removed = false;
	document.body.appendChild(soundEmbed);
}

function textcounter(field,cntfield,maxlimit) {
	if (field.value.length > maxlimit) {
		field.value = field.value.substring(0, maxlimit);
	}
	else {
		cntfield.value = maxlimit - field.value.length;
	}
}

function gen(size, extra) {
	reseed = Math.seedrandom();
	seed = Math.seedrandom(seed + reseed);
	seed = reseed;
	var str = "";
	var charset = "0123456789";
	if (extra) {
		charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	}
	while (str.length < size) {
       	str += charset.charAt(Math.floor(Math.random() * charset.length));
	}
 	return str;
}

function dhgen(key, pub) {
	if (pub == "gen") {
		prikey = str2bigInt(key, 10);
		pubkey = powMod(g, prikey, p);
		return bigInt2str(pubkey, 64);
	}
	else {
		pub = bigInt2str(powMod(str2bigInt(pub, 64), key, p), 64);
		return Crypto.PBKDF2(pub, Crypto.SHA256(pub), 32);
	}
}

function tagify(chat) {
	chat = chat.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	if ((match = chat.match(/((mailto\:|(news|(ht|f)tp(s?))\:\/\/){1}\S+)/gi)) && genurl) {
		for (mc = 0; mc <= match.length - 1; mc++) {
			var sanitize = match[mc].split("");
			for (ii = 0; ii <= sanitize.length-1; ii++) {
				if (!sanitize[ii].match(/\w|\d|\:|\/|\?|\=|\#|\+|\,|\.|\&|\;|\%/)) {
					sanitize[ii] = encodeURIComponent(sanitize[ii]);
				}
			}
			sanitize = sanitize.join("");
			chat = chat.replace(sanitize, "<a target=\"_blank\" href=\"" + "?redirect=" + escape(sanitize) + "\">" + match[mc] + "</a>");
		}
	}
	chat = chat.replace(/\&lt\;3/g, "<span class=\"monospace\">&#9829;</span>");
	if (match = chat.match(/^[a-z]+:\s\/me\s/)) {
		match = match[0];
		thisnick = match.match(/^[a-z]{1,12}/);
		chat = chat.replace(/^[a-z]+:\s\/me\s/, "<span class=\"nick\">* " + thisnick + " ") + " *</span>";
	}
	else if (match = chat.match(/^[a-z]{1,12}/)) {
		var stamp = getstamp(match[0]);
		chat = chat.replace(/^[a-z]+:/, "<span class=\"nick\" onmouseover=\"this.innerHTML = \'" + stamp + "\';\" onmouseout=\"this.innerHTML = \'" + match[0] + "\';\">" + match[0] + "</span>");
	}
	return chat;
}

function fliptag() {
	if (tag == "msg") { tag = "gsm"; }
	else { tag = "msg"; }
}

function process(line, flip) {
	if (line) {
		line = $.trim(line);
		if (!flip) {
			fliptag();
			line = tagify(line);
			if (names.length > 1) {
				line = "<div class=\"" + tag + "\" id=\"" + sentid + "\"><div class=\"text\">" + line + "</div></div>";
			}
			else {
				line = "<div class=\"" + tag + "\"><div class=\"text\">" + line + "</div></div>";
			}
			return line;
		}
		else if (match = line.match(/^[a-z]{1,12}:\s\[B-C\](\w|\/|\+|\?|\(|\)|\=|\|)+\[E-C\]$/)) {
			thisnick = $.trim(match[0].match(/^[a-z]{1,12}/));
			match = line.match(/\[B-C\](.*)\|/);
			match = match[0].substring(5, match[0].length - 1);
			var hmac = line.match(/\|\w{64}/);
			hmac = hmac[0].substring(1);
			line = line.replace(/\|\w{64}/, '');
			var loc = jQuery.inArray(thisnick, names);
			fliptag();
			if (Crypto.HMAC(Crypto.SHA256, match, seckeys[loc]) != hmac) {
				line = line.replace(/\[B-C\](.*)\[E-C\]/, "<span class=\"diffkey\">corrupt</span>");
				$("#" + pos).css("background-image","url(\"img/corrupt.png\")");
			}
			else {
				match = Crypto.AES.decrypt(match, seckeys[loc], {mode: new Crypto.mode.CBC(Crypto.pad.iso10126)});
				line = line.replace(/\[B-C\](.*)\[E-C\]/, match);
				line = tagify(line);
				line = "<div class=\"" + tag + "\" id=\"" + pos + "\"><div class=\"text\">" + line + "</div></div>";
			}
			$("#chat").html($("#chat").html() + line);
		}
		else if (match = line.match(/^(\&gt\;|\&lt\;) [a-z]{1,12} (has arrived|has left)$/)) {
			updatekeys();
			line = "<span class=\"nick\">" + match[0] + "</span>";
			fliptag();
			line = "<div class=\"" + tag + "\" id=\"" + pos + "\"><div class=\"text\">" + line + "</div></div>";
			$("#chat").html($("#chat").html() + line);
			$("#" + pos).css("background-image","url(\"img/user.png\")");
		}
		else {
			line = "<span class=\"diffkey\">corrupt</span>";
			fliptag();
			line = "<div class=\"" + tag + "\" id=\"" + pos + "\"><div class=\"text\">" + line + "</div></div>";
			$("#chat").html($("#chat").html() + line);
			$("#" + pos).css("background-image","url(\"img/corrupt.png\")");
		}
	}
	return "";
}

function updatekeys() {
	$.ajax({ url: install,
		type: "POST",
		async: false,
		data: "nick=" + $("#nickinput").val() + "&name=" + name + "&key=get",
		success: function(data) {
			oldnames = names;
			oldkeys = keys;
			data = data.split('|');
			names = new Array();
			keys = new Array();
			seckeys = new Array();
			fingerprints = new Array();
			for (i=0; i <= data.length - 2; i++) {
				sigmatch = data[i].match(/^[a-z]{1,12}:/);
				names[i] = sigmatch[0].substring(0, sigmatch[0].length - 1);
				sigmatch = data[i].match(/:.+/);
				keys[i] = sigmatch[0].substring(1);
				$("#chatters").html('<span class="chatters">' + names.length + '</span> ' + names.join(' '));
				var loc = jQuery.inArray(names[i], oldnames);
				seckeys[i] = dhgen(prikey, keys[i]);
				if (((keys[i].length != 682) && (keys[i].length != 683)) || 
				((names[i] == oldnames[loc]) && (keys[i] != oldkeys[loc]))) {
					var nbsp = "";
					for (ni=0; ni != 17; ni++) {
						nbsp += "&nbsp";
					}
					fingerprints[i] = nbsp + " <span class=\"red\">unreliable connection/keys</span>";
					$("#fingerlink").click();
				}
				else {
					fingerprints[i] = Crypto.SHA256(keys[i]);
					fingerprints[i] = fingerprints[i].substring(0, 8).toUpperCase() + ":" + 
					fingerprints[i].substring(16, 24).toUpperCase() + ":" + 
					fingerprints[i].substring(32, 40).toUpperCase() + ":" + 
					fingerprints[i].substring(48, 56).toUpperCase() + ":" + 
					fingerprints[i].substring(56, 64).toUpperCase();
				}
			}
		}
	});
	var fingerhtml = "Verify friends using their fingerprint. <br />(be certain of their identity - over the phone is fine.)<br /><br />";
	for (fi=0; fi <= names.length - 1; fi++) {
		var nbsp = "";
		for (ni=0; ni + names[fi].length != 13; ni++) {
			nbsp += "&nbsp";
		}
		fingerhtml += "<span class=\"blue\">" + names[fi] + "</span> " + nbsp + " " + fingerprints[fi] + "<br />";
	}
	fingerhtml += "<br /><input type=\"button\" onclick=\"fingerclose();\" id=\"close\" value=\"close\" />"; 
	$("#fingerprints").html(fingerhtml);
}

function updatechat() {
	$.ajax({ url: install,
		type: "POST",
		async: true,
		data: "chat=" + name + "&pos=" + pos,
		success: function(data) {
			if (data == "NOEXIST") {
				if (!errored && pubkey) {
					errordisplay("your chat no longer exists.");
				}
			}
			else if (data == "NOLOGIN") {
				if (!errored && pubkey) {
					errordisplay("you have been logged out.");
				}
			}
			else if (data != "") {
				pos++;
				if ((pos) && (nickset)) {
					$('#keygen').fadeOut('slow', function() {
						$("#changenick").fadeOut('fast');
						$("#nickentry").fadeOut('fast');
					    $("#front").fadeOut();
					});
					nickset = 0;
				}
				if (data.match(/\s/)) {
					process(data, 1);
					if ((document.getElementById("chat").scrollHeight - $("#chat").scrollTop()) < 600) {
						scrolldown();
					}
					if (!focus || ((document.getElementById("chat").scrollHeight - $("#chat").scrollTop()) > 600)) {
						num++;
						document.title = "[" + num + "] cryptocat";
					}
					if (sound) {
						soundPlay("snd/msg.ogg");
					}
				}
				else {
					$("#" + data).css("background-image","url(\"img/chat.png\")");
					$("#" + data).attr("id", "x");
				}
			}
			if (queue[0]) {
				var msg = "";
				for (var i=0; i != names.length; i++) {
					if (names && (names[i] != nick)) {
						var crypt = Crypto.AES.encrypt(queue[0].replace(/\$.+$/, ''), seckeys[i], {mode: new Crypto.mode.CBC(Crypto.pad.iso10126)});
						msg += "(" + names[i] + ")" + crypt;
						msg += "|" + Crypto.HMAC(Crypto.SHA256, crypt, seckeys[i]);
					}
				}
				msg = nick + "|" + queue[0].replace(/^.+\$/, '') + ": " + "[B-C]" + msg + "[E-C]";
				$.ajax({ url: install,
					type: "POST",
					async: true,
					data: "input=" + encodeURIComponent(msg) + "&name=" + name + "&talk=send",
				});
				queue.splice(0,1);
			}
		},
		error: function(data) {
		}
	});
	if (($("#chatters").html() != error) && (reconnect)) {
		errored = 0;
		reconnect = 0;
	}
	else if (reconnect) {
		updatekeys();
	}
}

$("#chatform").submit( function() {
	if (flood) {
		$('#flood').fadeIn('fast', function() {
			setTimeout("$('#flood').fadeOut(1000)", 500);
		});
	}
	else {
		var msg = $.trim($("#input").val());
		msg = msg.replace(/\$/g,"&#36;");
		var msgc = nick + ": " + msg;
		$("#input").val("");
		if (msg != "") {
			sentid = gen(8, 1);
			document.getElementById("chat").innerHTML += process(msgc, 0);
			scrolldown();
			if (names.length > 1) {
				flood = 1;
				setTimeout("flood = 0", 1000);
				$("#" + sentid).css("background-image","url(\"img/sending.gif\")");
				queue.push(msg + "$" + sentid);
				$("#talk").val(maxinput);
				document.getElementById("input").focus();
			}
		}
	}
	return false;
});

$("#nickform").submit( function() {
	$("#nickinput").val(document.getElementById("nickinput").value.toLowerCase());
	if (!pubkey) {
		$('#nickentry').fadeOut('slow', function() {
			$('#keygen').fadeIn('slow', function() {
				$('#keytext').html($('#keytext').html() + " &#160; <span class=\"blue\">OK</span><br />Generating keys");
				pubkey = dhgen(gen(32, 0), "gen");
				$('#keytext').html($('#keytext').html() + " &#160; &#160; <span class=\"blue\">OK</span><br />Communicating");
				nickajax();
			});
		});
	}
	else {
		nickajax();
	}
	return false;
});

$("#nickinput").keyup(function() {
	if ($("#nickinput").val().match(/^[a-z]{1,12}$/)) {
		$("#nick").html($("#nickinput").val());
	}
});

function nickajax() {
	$.ajax({ url: install,
		type: "POST",
		async: true,
		data: "nick=" + $("#nickinput").val() + "&name=" + name + "&key=" + encodeURIComponent(pubkey),
		success: function(data) {
			if ((data != "error") && (data != "inuse") && (data != "full")) {
				nickset = 1;
				updatechat();
				$('#keytext').html($('#keytext').html() + " &#160; &#160; &#160; <span class=\"blue\">OK</span>");
				nick = $("#nick").html();
				document.getElementById("input").focus();
				document.title = "[" + num + "] cryptocat";
				interval = setInterval("updatechat()", update);
			}
			else {
				$('#keygen').fadeOut('slow', function() {
					$("#nickentry").fadeIn('slow');
					if (data == "inuse") {
						$("#nickinput").val("nickname in use");
					}
					else if (data == "full") {
						$("#nickinput").val("chat is full");
					}
					else if (data == "error") {
						$("#nickinput").val("letters only");
					}
					$("#front").fadeIn();
					idSelect("nickinput");
				});
			}
		}
	});
}

$("#sound").click(function(){
	if (sound) {
		$("#sound").attr("src", "img/nosound.png");
		$("#sound").attr("title", "message sounds off");
		sound = 0;
		document.getElementById("input").focus();
	}
	else {
		$("#sound").attr("src", "img/sound.png");
		$("#sound").attr("title", "message sounds on");
		sound = 1;
		document.getElementById("input").focus();
	}
});

$("#fingerlink").click(function(){
	$('#front').fadeIn('fast');
	$('#fingerprints').fadeIn('slow', function() {
	});
});

function fingerclose() {
	$('#fingerprints').fadeOut('slow', function() {
		$('#front').fadeOut('fast');
	});
}

$("#maximize").click(function(){
	if ($("#maximize").attr("title") == "contract") {
		$("#main").animate({
			"margin-top": "4.5%",
			"min-width": "600px",
			"min-height": "420px",
			width: "600px",
			height: "420px"
		}, 500 );
		$("#info").animate({
			width: "588px",
		}, 500 );
		$("#chatters").animate({
			width: "525px",
			"padding-right": "3px"
		}, 500 );
		$("#input").animate({
			width: "508px",
		}, 500 );
		$("#talk").animate({
			width: "67px"
		}, 500 );
		$("#inchat").animate({
			width: "597px",
			height: "333px",
			"margin-bottom": "10px"
		}, 500 );
		$("#chat").animate({
			width: "608px",
			height: "330px"
		}, 500, function() {
			document.getElementById("chat").innerHTML = document.getElementById("chat").innerHTML;
			scrolldown();
		});
		$("#maximize").attr("src", "img/maximize.png");
		$("#maximize").attr("title", "expand");
		document.getElementById("input").focus();
	}
	else {
		$("#main").animate({
			"margin-top": "2%",
			"min-width": "900px",
			width: "80%",
			height: "90%"
		}, 500 );
		$("#info").animate({
			width: "99%"
		}, 500 );
		$("#chatters").animate({
			width: "92.3%",
			"padding-right": "20px"
		}, 500 );
		$("#input").animate({
			width: "92.3%"
		}, 500 );
		$("#talk").animate({
			width: "5%"
		}, 500 );
		$("#inchat").animate({
			width: "100%",
			height: "90%",
			"margin-bottom": "-30px"
		}, 500 );
		$("#chat").animate({
			width: "102%",
			height: "88%"
		}, 500, function() {
			document.getElementById("chat").innerHTML = document.getElementById("chat").innerHTML;
			scrolldown();
		});
		$("#maximize").attr("src", "img/minimize.png");
		$("#maximize").attr("title", "contract");
		document.getElementById("input").focus();
	}
});

$("#input").keyup(function(){
	textcounter(document.chatform.input,document.chatform.talk,256);
});

$("#talk").mouseout(function(){
	textcounter(document.chatform.input,document.chatform.talk,256);
});

$("#talk").mouseover(function(){
	$("#talk").val("send");
});

window.onfocus = function() {
	clearTimeout(blur);
	focus = true;
	num = 0;
	document.title = "[" + num + "] cryptocat";
}
window.onblur = function() {
	blur = setTimeout("focus = false", update);
}
document.onblur = window.onblur;
document.focus = window.focus;

function logout() {
	$.ajax({ url: install,
		type: "POST",
		async: false,
		data: "logout=" + name,
	});
}

function errordisplay(e) {
	$("#chatters").html("<span class=\"chatters\">x</span>&nbsp " + e);
	error = $("#chatters").html();
	errored = 1;
}

$(document).ajaxError(function(){
	if (!errored) {
		errordisplay("you have been disconnected. reconnecting...");
		reconnect = 1;
	}
});

$("#nickentry").fadeIn(); $("#front").fadeIn(); idSelect("nickinput");