<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.name" placeholder="专辑名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getAlbums">查询</el-button>
				</el-form-item>
				<el-form-item v-if="artistId != -1">
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表-->
		<el-table :data="albums" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="name" label="专辑名" show-overflow-tooltip sortable>
			</el-table-column>
			<el-table-column prop="author" label="作者" show-overflow-tooltip sortable>
      </el-table-column>
			<el-table-column prop="company" label="公司" show-overflow-tooltip sortable>
			</el-table-column>
      <el-table-column prop="picUrl" label="图片地址" show-overflow-tooltip>
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="$router.push('/song/' + scope.row.id)">管理歌曲</el-button>
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination 
        layout="prev, pager, next" 
        @current-change="handleCurrentChange" 
        :page-size="pageSize" 
        :total="total" 
        style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面-->
		<el-dialog title="编辑" v-model="editFormVisible" @close="imageUrl = ''" :close-on-click-modal="false">
			<el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
				<el-form-item label="专辑名" prop="name">
					<el-input v-model="editForm.name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="公司" prop="company">
					<el-input v-model="editForm.company" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="照片" prop="picUrl">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="editFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
			</div>
		</el-dialog>

		<!--新增界面-->
		<el-dialog v-if="artistId != -1" title="新增" v-model="addFormVisible" @close="imageUrl = ''" :close-on-click-modal="false">
			<el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
				<el-form-item label="专辑名" prop="name">
					<el-input v-model="addForm.name" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="公司" prop="company">
					<el-input v-model="addForm.company" auto-complete="off"></el-input>
				</el-form-item>
        <el-form-item label="照片" prop="picUrl">
          <el-upload
            class="avatar-uploader"
            action="http://localhost:8080/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="addFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
  import Api from '@/api'

	export default {
		data() {
			return {
        artistId: -1,
				filters: {
					name: ''
        },
        imageUrl: '',
        albums: [],
				total: 0,
				page: 1,
				pageSize: 20,
				listLoading: false,
				sels: [],//列表选中列

				editFormVisible: false,
				editLoading: false,
				editFormRules: {
					name: [
						{ required: true, message: '请输入专辑名', trigger: 'blur' }
					]
				},
				editForm: {},
        
				addFormVisible: false,
				addLoading: false,
				addFormRules: {
					name: [
						{ required: true, message: '请输入专辑名', trigger: 'blur' }
					]
				},
				addForm: {}
			}
		},
		methods: {
      handleAvatarSuccess(res, file) {
        console.log(res)
        console.log(file)
        this.imageUrl = res.data.url
      },

      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        return isJPG;
      },

			handleCurrentChange(val) {
				this.page = val;
				this.getAlbums();
      },
      
      getAlbums() {
        let params = {
          page: this.page,
          name: this.filters.name,
          size: this.pageSize,
          aid: this.artistId,
        }
        this.listLoading = true;
        Api.getAlbums(params).then(function(res) {
          // debugger
          console.log(res)
          this.albums = res.data.data
          this.total = res.data.total
					this.listLoading = false
        }.bind(this)).catch(function(err) {
          console.log(err)
        })
      },
   
      //显示新增界面
			handleAdd: function () {
				this.addFormVisible = true;
				this.addForm = {
          name: '',
          picUrl: '',
					company: '',
					artistId: this.artistId,
				};
      },

      //新增
			addSubmit: function () {
				this.$refs.addForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
							this.addLoading = true;
              this.addForm.picUrl = this.imageUrl
              let para = Object.assign({}, this.addForm);
							Api.addAlbum(para).then(function(res) {
                console.log(res)
                if (res.data.code != 0) {
                  this.$message({
                    message: res.data.msg,
                    type: 'error'
									})
									this.addLoading = false;
                  return
                }
								this.addLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['addForm'].resetFields();
								this.addFormVisible = false;
                this.getAlbums();
                
							}.bind(this)).catch(function(err) {
                console.log(err)
                this.addLoading = false;
								this.$message({
									message: err.message,
									type: 'error'
                });
                this.listLoading = false;
                
              }.bind(this));
						});
					}
				});
			},
      
			//显示编辑界面
			handleEdit: function (index, row) {
				this.editFormVisible = true;
        this.editForm = Object.assign({}, row);
        this.imageUrl = this.editForm.picUrl
			},
			
			//编辑
			editSubmit: function () {
				this.$refs.editForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认提交吗？', '提示', {}).then(() => {
              this.editLoading = true;
              if(this.imageUrl != '')
                this.editForm.picUrl = this.imageUrl
							let para = Object.assign({}, this.editForm);
							Api.updateAlbum(para).then(function(res) {
                console.log(res)
                if (res.data.code != 0) {
                  this.$message({
                    message: res.data.msg,
                    type: 'error'
									})
									this.editLoading = false;
                  return
                }
								this.editLoading = false;
								this.$message({
									message: '提交成功',
									type: 'success'
								});
								this.$refs['editForm'].resetFields();
								this.editFormVisible = false;
                this.getAlbums();
                
							}.bind(this)).catch(function(err) {
                console.log(err)
                this.addLoading = false;
								this.$message({
									message: err.message,
									type: 'error'
                });
                this.listLoading = false;

              }.bind(this))
						});
					}
				});
			},
			
			selsChange: function (sels) {
				this.sels = sels;
      },
      
      //删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					Api.delAlbum(row.id).then(function(res) {
            console.log(res)
            if (res.data.code != 0) {
              this.$message({
                message: res.data.msg,
                type: 'error'
							})
							this.listLoading = false;
              return
            }
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
            this.getAlbums();
            
					}.bind(this)).catch(function(err) {
            console.log(err)
            this.addLoading = false;
            this.$message({
              message: err.message,
              type: 'error'
            });
            this.listLoading = false;

          }.bind(this))   
				}).catch(() => {
          
				});
      },

			//批量删除
			batchRemove: function () {
        var ids = this.sels.map(item => item.id)
				this.$confirm('确认删除选中记录吗？', '提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					Api.delAlbums(ids).then(function(res) {
            console.log(res)
            if (res.data.code != 0) {
              this.$message({
                message: res.data.msg,
                type: 'error'
							})
							this.listLoading = false;
              return
            }
						this.listLoading = false;
						this.$message({
							message: '删除成功',
							type: 'success'
						});
            this.getAlbums();
            
					}.bind(this)).catch(function(err) {
            console.log(err)
            this.addLoading = false;
            this.$message({
              message: err.message,
              type: 'error'
            });
            this.listLoading = false;

          }.bind(this)) 

				}).catch(() => {

				});
			}
    },
    
		mounted() {
			if (this.$route.params.id !== undefined)
				this.artistId = this.$route.params.id
			this.getAlbums();
		}
	}

</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>