import Login from './components/Login'
import NotFound from './components/404'
import Home from './components/Home'
import Artist from './components/Artist'
import Album from './components/Album'
import Song from './components/Song'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '音乐数据管理',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/artist', component: Artist, name: '歌手管理' },
            { path: '/album', component: Album, name: '专辑管理' },
            { path: '/song', component: Song, name: '歌曲管理' },
            {
                path: '/album/:id',
                component: Album,
                name: '特定歌手专辑管理',
                hidden: true
            },
            {
                path: '/song/:id',
                component: Song,
                name: '特定专辑歌曲管理',
                hidden: true
            },
        ]
    },
    // {
    //     path: '/',
    //     component: Home,
    //     name: '',
    //     iconCls: 'fa fa-address-card',
    //     leaf: true,//只有一个节点
    //     children: [
    //         { path: '/page5', component: Artist, name: '没啥用' }
    //     ]
    // },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;