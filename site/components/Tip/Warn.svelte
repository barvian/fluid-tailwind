<script lang="ts">
</script>

<div class="WarnTip flex w-fit items-start gap-4 rounded-md bg-amber-500/10 p-4 dark:bg-black/25">
	<svg
		viewBox="0 0 20 20"
		fill="currentColor"
		role="presentation"
		class="mt-1 size-5 shrink-0 fill-amber-900 dark:fill-amber-100"
		><path
			fill-rule="evenodd"
			d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
			clip-rule="evenodd"
		></path></svg
	>

	<p
		class="light:prose-code:text-current light:prose-a:text-current light:text-amber-900 m-0 flex-1 text-sm leading-6"
	>
		<slot />
	</p>
</div>
