<script lang="ts">
	let { items } = $props();
</script>

<button
	id="dropdownDefaultButton"
	data-dropdown-toggle="dropdown"
	class="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
	type="button"
	>Dropdown button <svg
		class="ms-3 h-2.5 w-2.5"
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 10 6"
	>
		<path
			stroke="currentColor"
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="m1 1 4 4 4-4"
		/>
	</svg>
</button>

<!-- Dropdown menu -->
<div
	id="dropdown"
	class="z-10 hidden w-44 divide-y divide-gray-100 rounded-lg bg-white shadow-sm dark:bg-gray-700"
>
	<ul
		class="py-2 text-sm text-gray-700 dark:text-gray-200"
		aria-labelledby="dropdownDefaultButton"
	>
		<li>
			<a
				href="#"
				class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
				>test</a
			>
		</li>
		<li>
			<a
				href="#"
				class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
				>1-2</a
			>
		</li>
	</ul>
</div>
