<form id="connect" method="post" action="">
  <div class="row">
    <div class="col-sm-12">
      <h1>Network settings</h1>
    </div>
    <div class="col-sm-3">
      <label>Name</label>
    </div>
    <div class="col-sm-9">
      <input class="input" name="name" value="Freenode">
    </div>
    <div class="col-sm-3">
      <label>Server</label>
    </div>
    <div class="col-sm-6 col-xs-8">
      <input class="input" name="host" value="irc.freenode.org">
    </div>
    <div class="col-sm-3 col-xs-4">
      <div class="port">
        <input class="input" name="port" value="6667">
      </div>
    </div>
    <div class="clearfix"></div>
    <div class="col-sm-3">
      <label>Password</label>
    </div>
    <div class="col-sm-9">
      <input class="input" type="password" name="password" value="">
    </div>
    <div class="col-sm-3"></div>
    <div class="col-sm-9">
      <label class="tls">
        <input type="checkbox" name="tls" >
        Enable TLS/SSL
      </label>
    </div>
    <div class="clearfix"></div>
    <div class="col-sm-12">
      <h1>User preferences</h1>
    </div>
    <div class="col-sm-3">
      <label>Nick</label>
    </div>
    <div class="col-sm-5">
      <input class="input nick" name="nick" value="shout-user">
    </div>
    <div class="clearfix"></div>
    <div class="col-sm-3">
      <label>Username</label>
    </div>
    <div class="col-sm-5">
      <input class="input username" name="username" value="shout-user">
    </div>
    <div class="clearfix"></div>
    <div class="col-sm-3">
      <label>Real name</label>
    </div>
    <div class="col-sm-9">
      <input class="input" name="realname" value="Shout User">
    </div>
    <div class="col-sm-3">
      <label>Channels</label>
    </div>
    <div class="col-sm-9">
      <input class="input" name="join" value="#foo, #shout-irc">
    </div>
    <div class="col-sm-3 clearfix"></div>
    <div class="col-sm-9">
      <button type="submit">
        Connect
      </button>
    </div>
  </div>
</form>
