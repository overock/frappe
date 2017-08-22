// TODO : class="frappe-action"은 action.js에서 addClass해버릴까
export default {
    ghost: {
        markup: '<rect class="frappe-action" width="64" height="64" rx="12" ry="12"/>',
        props: {},
        rules: {}
    },
    start: {
        markup: '<image class="frappe-action" data-actiontype="start" xlink:href="images/wd-start.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {}
    },
    end: {
        markup: '<image class="frappe-action" data-actiontype="end" xlink:href="images/wd-end.png" width="40" height="40"/>',
        width: 40,
        height: 40,
        props: {},
        rules: {}
    },
    kill: {
        markup: '<image class="frappe-action" data-actiontype="kill" xlink:href="images/wd-kill.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    fork: {
        markup: '<image class="frappe-action" data-actiontype="fork" xlink:href="images/wd-fork.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    join: {
        markup: '<image class="frappe-action" data-actiontype="join" xlink:href="images/wd-join.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },

    mapreduce: {
        markup: '<image class="frappe-action" data-actiontype="mapreduce" xlink:href="images/wd-mapreduce.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    filesystem: {
        markup: '<image class="frappe-action" data-actiontype="filesystem" xlink:href="images/wd-fs.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    // streaming: {
    //     markup: '<image class="frappe-action" xlink:href="images/wd-fs.png" width="64" height="64"/>',
    //     props: {},
    //     rules: {}
    // },
    spark: {
        markup: '<image class="frappe-action" data-actiontype="spark" xlink:href="images/wd-spark.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    hive: {
        markup: '<image class="frappe-action" data-actiontype="hive" xlink:href="images/wd-hive.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    java: {
        markup: '<image class="frappe-action" data-actiontype="java" xlink:href="images/wd-java.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    pig: {
        markup: '<image class="frappe-action" data-actiontype="pig" xlink:href="images/wd-pig.png" width="64" height="64"/>',
        props: {},
        rules: {}
    },
    subworkflow: {
        markup: '<image class="frappe-action" data-actiontype="subworkflow" xlink:href="images/wd-sub-workflow.png" width="64" height="64"/>',
        props: {},
        rules: {}
    }
};