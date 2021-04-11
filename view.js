// ---- Define your dialogs  and panels here ----

var efPanel = define_new_effective_permissions("efPan",true);
$('#sidepanel').append(efPanel);

//create instructions div
const instructions_div = document.createElement("div");
var viewing_instructions = "Select a user and file or folder to view thier permissions";
const instructions_text = document.createTextNode(viewing_instructions);
instructions_div.appendChild(instructions_text);
instructions_div.classList.add("imp-text");
$('#sidepanel').append(instructions_div);

//create disclaimer div
const disclaimer_div = document.createElement("div");
var viewing_instructions = "(if nothings appears, user most likely does not have permissions for selected file/folder)";
const disclaimer_text = document.createTextNode(viewing_instructions);
disclaimer_div.appendChild(disclaimer_text);
$('#sidepanel').append(disclaimer_div);

//create file selector
var file_selector = ` <select name="files" id="file-select" onchange="updateFile(event)">`;
for (var element in path_to_file) {
    file_selector += `<option value="${element}">${element}</option>`;
}
file_selector += `</select>`;
console.log(file_selector)
$('#sidepanel').append(file_selector);

//change filepath attribute on file selector change
$('#efPan').attr('filepath', '/C');
function updateFile(e) {            //update file/folder for side panel
    console.log(e.target.value);
    $('#efPan').attr('filepath', e.target.value); 
}

//select user for side panel
var newUser = define_new_user_select_field("s_user", "select a user", on_user_change = function(selected_user){
    $('#efPan').attr('username', selected_user)
});
$('#sidepanel').append(newUser);



//dialog box for info onclick
var newDialogue = define_new_dialog("newD", title='', options = {})
$('.perm_info').click(function(){
    $('#newD').dialog("open");
    let file_name = $('#efPan').attr('filepath');
    let user_name = $('#efPan').attr('username');
    let permission_name = $(this).attr('permission_name');
    console.log(file_name ," , ", user_name," , ", permission_name);

    var my_file_obj_var = path_to_file[file_name];
    var my_user_obj_var = all_users[user_name];

    console.log(file_name == null);
    console.log(user_name == null);
    var explanation_text = "";

    if (file_name == null || user_name == null) {
        explanation_text = "Pick a File and User to view thier permissions.";
        console.log("something null")
    } else {
        let explanation = allow_user_action(my_file_obj_var, my_user_obj_var, permission_name, true);
        console.log(explanation)
        explanation_text = get_explanation_text(explanation, user_name, file_name, permission_name);
    }
    
    $('#newD').html(explanation_text);
    $('#newD').dialog({
        closeText: "OK"
    });
})





// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)
    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-pencil" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
            <span class="oi oi-pencil" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 