import ByteArray					= require("awayjs-core/lib/utils/ByteArray");

import ContextStage3D				= require("awayjs-stagegl/lib/base/ContextStage3D");
import IProgram						= require("awayjs-stagegl/lib/base/IProgram");
import OpCodes						= require("awayjs-stagegl/lib/base/OpCodes");
import ResourceBaseFlash			= require("awayjs-stagegl/lib/base/ResourceBaseFlash");

class ProgramFlash extends ResourceBaseFlash implements IProgram
{
	private _context:ContextStage3D;

	constructor(context:ContextStage3D)
	{
		super();

		this._context = context;
		this._context.addStream(String.fromCharCode(OpCodes.initProgram));
		this._pId = this._context.execute();
		this._context._iAddResource(this);
	}

	public upload(vertexProgram:ByteArray, fragmentProgram:ByteArray)
	{
		this._context.addStream(String.fromCharCode(OpCodes.uploadAGALBytesProgram, this._pId + OpCodes.intMask) + vertexProgram.readBase64String(vertexProgram.length) + "%" + fragmentProgram.readBase64String(fragmentProgram.length) + "%");

		if (ContextStage3D.debug)
			this._context.execute();
	}

	public dispose()
	{
		this._context.addStream(String.fromCharCode(OpCodes.disposeProgram, this._pId + OpCodes.intMask));
		this._context.execute();
		this._context._iRemoveResource(this);

		this._context = null;
	}
}

export = ProgramFlash;