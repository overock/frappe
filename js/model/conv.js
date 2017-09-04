export default class {
    static import(pool) { return pool; }

    static export(pool) {
        const ret = {};

        pool.container.filter(v => !v.isFlow).forEach(v => {
            const action = {
                '@name': v.uuid
            };
            
            v.next.map(v => v.next[0]).forEach(v => {
                switch(v.type) {
                case 'kill':
                    action['error'] = { '@to': v.uuid };
                    break;

                default:
                    action['ok'] = { '@to': v.uuid };
                }
            });
            ret[v.type] = action;
        });

        return ret;
    }
}