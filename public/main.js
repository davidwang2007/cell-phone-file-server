
$(document).ready(function(){
    var file = $('#file');
    var trigger = $('#file-trigger');
    file.change(function(){
        console.log('file changes');
        console.log(this.files);
        var val = Array.prototype.map.call(this.files,function(f){
            return f.name;
        }).join(', ');
        trigger.val(val);
    });
    trigger.click(function(){
        file.click();
    });
    trigger.keypress(function(){
        return false;
    });
    $('form').submit(function(){
        if(trigger.val() == ''){
            confirm('请选择文件');
            return false;
        }

    });
});