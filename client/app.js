let bpApp = new Vue({
	el:'#bpList',
	data:{
		filter:'',
		blueprints:[],
		items:[]
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
			console.log(this.items);
			/* why doesn't this work?
			let existing = this.items.findExisting((item) => {
				return item.title === item;
			});
			*/
			let existing = -1;
			for(let i=0;i<this.items.length;i++) {
				if(this.items[i].title === item) existing = i;
			}
			console.log('for '+item+' existing is '+existing);
			if(existing === -1) {
				this.items.push({title:item, qty:0});
			} else {
				this.items[existing].qty++;
			}

			this.items = this.items.sort((a,b) => {
				if(a.title > b.title) return 1;
				if(a.title < b.title) return -1;
				return 0;
			});
		},
		removeFromCart:function(item) {
			console.log('remove '+item);
			let existing = -1;
			for(let i=0;i<this.items.length;i++) {
				if(this.items[i].title === item) existing = i;
			}
			if(existing !== -1) {
				//in theory it should ALWAYs match, but...
				this.items.splice(existing, 1);
			}
		}
	}
});