<div class="msg {{type}} {{#if self}}self{{/if}}">
	<span class="time">
		{{tz time}}
	</span>
	<span class="from"></span>
	<span class="text">
		<a href="#" class="user" data-name="{{from}}">{{mode}}{{from}}</a>
		{{formattedAction}}
		{{{parse text}}}
	</span>
</div>
