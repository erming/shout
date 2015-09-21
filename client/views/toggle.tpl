{{#toggle}}
<div class="toggle-content">
	{{#equal type "image"}}
		<a href="{{link}}" target="_blank">
			<img src="{{link}}">
		</a>
	{{else}} {{#equal type "gfyembed"}}
		<div class="gfyitem" data-title=true data-autoplay=true data-controls=true data-expand=false data-id="{{gfyname}}" ></div>
	{{else}}
		<a href="{{link}}" target="_blank">
			{{#if thumb}}
				<img src="{{thumb}}" class="thumb">
			{{/if}}
			<div class="head">{{{parse head}}}</div>
			<div class="body">
				{{body}}
			</div>
		</a>
	{{/equal}} {{/equal}}
</div>
{{/toggle}}
