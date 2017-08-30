let bpApp = new Vue({
	el:'#bpList',
	data:{
		filter:'',
		blueprints:[]
	},
	created:function() {
		fetch('./data.json')
		.then(res => res.json())
		.then(res => {
			this.blueprints = res;
		});
	},
	computed:{
		filteredBlueprints: function() {
			let thatFilter = this.filter.toLowerCase();
			return this.blueprints.filter(function(bp) {
				if(thatFilter === '') return true;
				if(bp.title.toLowerCase().indexOf(thatFilter) >= 0) return true;
				return false;
			});
		}
	},
	methods:{
		addToCart:function(item) {
			console.log('addToCart',item);
		}
	}
});